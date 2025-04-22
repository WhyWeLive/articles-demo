import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '@app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserEntity } from '@common/entities/user.entity';
import { ArticleEntity } from '@common/entities/article.entity';
import { Repository } from 'typeorm';
import bcrypt from 'bcrypt';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

describe('ArticleController (e2e)', () => {
  let app: INestApplication;
  let userRepository: Repository<UserEntity>;
  let articleRepository: Repository<ArticleEntity>;
  let cacheManager: Cache;
  let jwtToken: string;
  let userId: number;
  let testArticleId: number;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    app.enableCors();
    app.getHttpAdapter().getInstance().disable('x-powered-by');

    await app.init();

    userRepository = moduleFixture.get<Repository<UserEntity>>(
      getRepositoryToken(UserEntity),
    );

    articleRepository = moduleFixture.get<Repository<ArticleEntity>>(
      getRepositoryToken(ArticleEntity),
    );

    cacheManager = moduleFixture.get<Cache>(CACHE_MANAGER);

    // Delete test users and articles if they exist
    await articleRepository.delete({});
    await userRepository.delete({ email: 'test@example.com' });

    // Create a test user
    const hashedPassword = await bcrypt.hash('password123', 10);
    const user = await userRepository.save({
      name: 'Test User',
      email: 'test@example.com',
      password: hashedPassword,
    });

    userId = user.id;

    // Get JWT token for authenticated requests
    const loginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    const response = await request(app.getHttpServer())
      .post('/authentication/login/')
      .send(loginDto);

    jwtToken = response.body.token;
  });

  afterEach(async () => {
    await app.close();
  });

  describe('GET /articles/', () => {
    beforeEach(async () => {
      // Create test articles
      await articleRepository.save([
        {
          title: 'Test Article 1',
          description: 'This is test article 1',
          authorId: userId,
        },
        {
          title: 'Test Article 2',
          description: 'This is test article 2',
          authorId: userId,
        },
      ]);
    });

    it('should return paginated articles without authentication', async () => {
      const response = await request(app.getHttpServer())
        .get('/articles/')
        .query({ page: 0, limit: 10 })
        .expect(200);

      expect(response.body).toHaveProperty('items');
      expect(response.body).toHaveProperty('count');
      expect(response.body).toHaveProperty('page');
      expect(response.body).toHaveProperty('limit');
      expect(Array.isArray(response.body.items)).toBe(true);
      expect(response.body.items.length).toBeGreaterThan(0);

      // Check article structure
      const article = response.body.items[0];
      expect(article).toHaveProperty('id');
      expect(article).toHaveProperty('title');
      expect(article).toHaveProperty('description');
      expect(article).toHaveProperty('author');
      expect(article).toHaveProperty('createdAt');
      expect(article.author).toHaveProperty('id');
      expect(article.author).toHaveProperty('name');
    });

    it('should use cache for subsequent GET requests', async () => {
      // First request should cache the response
      const firstResponse = await request(app.getHttpServer())
        .get('/articles/')
        .query({ page: 0, limit: 10 })
        .expect(200);

      // Create a new article that shouldn't appear in the cached response
      await articleRepository.save({
        title: 'New Article After Cache',
        description: 'This article should not appear in cached response',
        authorId: userId,
      });

      // Second request should return cached response
      const secondResponse = await request(app.getHttpServer())
        .get('/articles/')
        .query({ page: 0, limit: 10 })
        .expect(200);

      // Both responses should be identical (from cache)
      expect(secondResponse.body).toEqual(firstResponse.body);

      // Count should be the same despite adding a new article
      expect(secondResponse.body.count).toBe(firstResponse.body.count);
    });

    it('should return different results for different pagination parameters', async () => {
      // Request with page 0, limit 1
      const response1 = await request(app.getHttpServer())
        .get('/articles/')
        .query({ page: 0, limit: 1 })
        .expect(200);

      // Request with page 1, limit 1
      const response2 = await request(app.getHttpServer())
        .get('/articles/')
        .query({ page: 1, limit: 1 })
        .expect(200);

      // Both should have different items
      expect(response1.body.items[0].id).not.toBe(response2.body.items[0].id);
    });
  });

  describe('GET /articles/:id/', () => {
    beforeEach(async () => {
      // Create a test article
      const article = await articleRepository.save({
        title: 'Test Article',
        description: 'This is a test article',
        authorId: userId,
      });

      testArticleId = article.id;
    });

    it('should return an article by ID without authentication', async () => {
      const response = await request(app.getHttpServer())
        .get(`/articles/${testArticleId}/`)
        .expect(200);

      expect(response.body).toHaveProperty('id', testArticleId);
      expect(response.body).toHaveProperty('title', 'Test Article');
      expect(response.body).toHaveProperty(
        'description',
        'This is a test article',
      );
      expect(response.body).toHaveProperty('author');
      expect(response.body).toHaveProperty('createdAt');
      expect(response.body.author).toHaveProperty('id', userId);
      expect(response.body.author).toHaveProperty('name', 'Test User');
    });

    it('should use cache for subsequent GET requests for the same article', async () => {
      // First request should cache the response
      await request(app.getHttpServer())
        .get(`/articles/${testArticleId}/`)
        .expect(200);

      // Update the article directly in the database
      await articleRepository.update(testArticleId, {
        title: 'Updated Title That Should Not Be Seen',
      });

      // Second request should return cached response with old title
      const secondResponse = await request(app.getHttpServer())
        .get(`/articles/${testArticleId}/`)
        .expect(200);

      // Title should still be the original one from cache
      expect(secondResponse.body.title).toBe('Test Article');
    });

    it('should return 404 for non-existent article', async () => {
      await request(app.getHttpServer()).get('/articles/9999/').expect(404);
    });
  });

  describe('POST /articles/', () => {
    it('should create a new article when authenticated', async () => {
      const articleDto = {
        title: 'New Test Article',
        description: 'This is a new test article',
      };

      const response = await request(app.getHttpServer())
        .post('/articles/')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send(articleDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('title', articleDto.title);
      expect(response.body).toHaveProperty(
        'description',
        articleDto.description,
      );
      expect(response.body).toHaveProperty('author');
      expect(response.body.author).toHaveProperty('id', userId);

      // Save the article ID for later tests
      testArticleId = response.body.id;

      // Verify the article was created in the database
      const article = await articleRepository.findOne({
        where: { id: testArticleId },
      });
      expect(article).toBeDefined();
      expect(article.title).toBe(articleDto.title);
    });

    it('should return 401 when not authenticated', async () => {
      const articleDto = {
        title: 'New Test Article',
        description: 'This is a new test article',
      };

      await request(app.getHttpServer())
        .post('/articles/')
        .send(articleDto)
        .expect(401);
    });

    it('should return 400 for invalid article data', async () => {
      // Missing description
      const invalidArticleDto = {
        title: 'New Test Article',
      };

      await request(app.getHttpServer())
        .post('/articles/')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send(invalidArticleDto)
        .expect(400);
    });

    it('should update cache after creating an article', async () => {
      // Create a new article
      const articleDto = {
        title: 'Cache Test Article',
        description: 'This article should be cached',
      };

      const createResponse = await request(app.getHttpServer())
        .post('/articles/')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send(articleDto)
        .expect(201);

      const newArticleId = createResponse.body.id;

      // Get the article to verify it's in the cache
      const getResponse = await request(app.getHttpServer())
        .get(`/articles/${newArticleId}/`)
        .expect(200);

      // The response should match the created article
      expect(getResponse.body).toHaveProperty('id', newArticleId);
      expect(getResponse.body).toHaveProperty('title', articleDto.title);
    });
  });

  describe('PUT /articles/:id/', () => {
    beforeEach(async () => {
      // Create a test article
      const article = await articleRepository.save({
        title: 'Test Article for Update',
        description: 'This article will be updated',
        authorId: userId,
      });

      testArticleId = article.id;
    });

    it('should update an article when authenticated and authorized', async () => {
      const updateDto = {
        title: 'Updated Test Article',
        description: 'This article has been updated',
      };

      const response = await request(app.getHttpServer())
        .put(`/articles/${testArticleId}/`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .send(updateDto)
        .expect(200);

      expect(response.body).toHaveProperty('id', testArticleId);
      expect(response.body).toHaveProperty('title', updateDto.title);
      expect(response.body).toHaveProperty(
        'description',
        updateDto.description,
      );

      // Verify the article was updated in the database
      const article = await articleRepository.findOne({
        where: { id: testArticleId },
      });
      expect(article).toBeDefined();
      expect(article.title).toBe(updateDto.title);
    });

    it('should return 401 when not authenticated', async () => {
      const updateDto = {
        title: 'Updated Test Article',
        description: 'This article has been updated',
      };

      await request(app.getHttpServer())
        .put(`/articles/${testArticleId}/`)
        .send(updateDto)
        .expect(401);
    });

    it('should update cache after updating an article', async () => {
      const updateDto = {
        title: 'Cache Update Test',
        description: 'This update should be reflected in the cache',
      };

      // Update the article
      await request(app.getHttpServer())
        .put(`/articles/${testArticleId}/`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .send(updateDto)
        .expect(200);

      // Get the article to verify the cache was updated
      const getResponse = await request(app.getHttpServer())
        .get(`/articles/${testArticleId}/`)
        .expect(200);

      // The response should have the updated data
      expect(getResponse.body).toHaveProperty('title', updateDto.title);
      expect(getResponse.body).toHaveProperty(
        'description',
        updateDto.description,
      );
    });
  });

  describe('PATCH /articles/:id/', () => {
    beforeEach(async () => {
      // Create a test article
      const article = await articleRepository.save({
        title: 'Test Article for Patch',
        description: 'This article will be patched',
        authorId: userId,
      });

      testArticleId = article.id;
    });

    it('should partially update an article when authenticated and authorized', async () => {
      // Only update the title
      const patchDto = {
        title: 'Patched Test Article',
      };

      const response = await request(app.getHttpServer())
        .patch(`/articles/${testArticleId}/`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .send(patchDto)
        .expect(200);

      expect(response.body).toHaveProperty('id', testArticleId);
      expect(response.body).toHaveProperty('title', patchDto.title);
      // Description should remain unchanged
      expect(response.body).toHaveProperty(
        'description',
        'This article will be patched',
      );

      // Verify the article was updated in the database
      const article = await articleRepository.findOne({
        where: { id: testArticleId },
      });
      expect(article).toBeDefined();
      expect(article.title).toBe(patchDto.title);
      expect(article.description).toBe('This article will be patched');
    });

    it('should return 401 when not authenticated', async () => {
      const patchDto = {
        title: 'Patched Test Article',
      };

      await request(app.getHttpServer())
        .patch(`/articles/${testArticleId}/`)
        .send(patchDto)
        .expect(401);
    });

    it('should update cache after patching an article', async () => {
      const patchDto = {
        description: 'This patch should be reflected in the cache',
      };

      // Patch the article
      await request(app.getHttpServer())
        .patch(`/articles/${testArticleId}/`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .send(patchDto)
        .expect(200);

      // Get the article to verify the cache was updated
      const getResponse = await request(app.getHttpServer())
        .get(`/articles/${testArticleId}/`)
        .expect(200);

      // The response should have the patched data
      expect(getResponse.body).toHaveProperty(
        'title',
        'Test Article for Patch',
      );
      expect(getResponse.body).toHaveProperty(
        'description',
        patchDto.description,
      );
    });
  });

  describe('DELETE /articles/:id/', () => {
    beforeEach(async () => {
      // Create a test article
      const article = await articleRepository.save({
        title: 'Test Article for Deletion',
        description: 'This article will be deleted',
        authorId: userId,
      });

      testArticleId = article.id;
    });

    it('should delete an article when authenticated and authorized', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/articles/${testArticleId}/`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', testArticleId);
      expect(response.body).toHaveProperty(
        'title',
        'Test Article for Deletion',
      );

      // Verify the article was deleted from the database
      const article = await articleRepository.findOne({
        where: { id: testArticleId },
      });
      expect(article).toBeNull();
    });

    it('should return 401 when not authenticated', async () => {
      await request(app.getHttpServer())
        .delete(`/articles/${testArticleId}/`)
        .expect(401);
    });

    it('should clear cache after deleting an article', async () => {
      // First, get the article to ensure it's cached
      await request(app.getHttpServer())
        .get(`/articles/${testArticleId}/`)
        .expect(200);

      // Delete the article
      await request(app.getHttpServer())
        .delete(`/articles/${testArticleId}/`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200);

      // Try to get the deleted article, should return 404
      await request(app.getHttpServer())
        .get(`/articles/${testArticleId}/`)
        .expect(404);
    });

    it('should clear paginated cache after deleting an article', async () => {
      // First, get the articles list to ensure it's cached
      const firstResponse = await request(app.getHttpServer())
        .get('/articles/')
        .query({ page: 0, limit: 10 })
        .expect(200);

      const initialCount = firstResponse.body.count;

      // Delete the article
      await request(app.getHttpServer())
        .delete(`/articles/${testArticleId}/`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200);

      // Get the articles list again, should reflect the deletion
      const secondResponse = await request(app.getHttpServer())
        .get('/articles/')
        .query({ page: 0, limit: 10 })
        .expect(200);

      // Count should be one less than before
      expect(secondResponse.body.count).toBe(initialCount - 1);
    });
  });
});
