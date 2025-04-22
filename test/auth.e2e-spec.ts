import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '@app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserEntity } from '@common/entities/user.entity';
import { Repository } from 'typeorm';
import bcrypt from 'bcrypt';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let userRepository: Repository<UserEntity>;
  let jwtToken: string;

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

    // Delete test users if they exist
    await userRepository.delete({ email: 'test@example.com' });
  });

  afterEach(async () => {
    await app.close();
  });

  describe('/authentication/register/ (POST)', () => {
    it('should register a new user and return a JWT token', () => {
      const registerDto = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      };

      // Use endpoint without trailing slash
      return request(app.getHttpServer())
        .post('/authentication/register')
        .send(registerDto)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('token');
          expect(typeof res.body.token).toBe('string');
          jwtToken = res.body.token;
        });
    });

    it('should return 400 if email is invalid', () => {
      const registerDto = {
        name: 'Test User',
        email: 'invalid-email',
        password: 'password123',
      };

      return request(app.getHttpServer())
        .post('/authentication/register/')
        .send(registerDto)
        .expect(400);
    });

    it('should return 400 if required fields are missing', () => {
      const registerDto = {
        name: 'Test User',
        // email is missing
        password: 'password123',
      };

      return request(app.getHttpServer())
        .post('/authentication/register/')
        .send(registerDto)
        .expect(400);
    });

    it('should return 409 if user with the same email already exists', async () => {
      // Create a user first
      const registerDto = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      };

      await request(app.getHttpServer())
        .post('/authentication/register/')
        .send(registerDto)
        .expect(201);

      // Try to register with the same email
      return request(app.getHttpServer())
        .post('/authentication/register/')
        .send(registerDto)
        .expect(409);
    });
  });

  describe('/authentication/login/ (POST)', () => {
    beforeEach(async () => {
      // Create a user for login tests
      const hashedPassword = await bcrypt.hash('password123', 10);
      await userRepository.save({
        name: 'Test User',
        email: 'test@example.com',
        password: hashedPassword,
      });
    });

    it('should login a user and return a JWT token', () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      return request(app.getHttpServer())
        .post('/authentication/login/')
        .send(loginDto)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('token');
          expect(typeof res.body.token).toBe('string');
          jwtToken = res.body.token;
        });
    });

    it('should return 401 if email is incorrect', () => {
      const loginDto = {
        email: 'wrong@example.com',
        password: 'password123',
      };

      return request(app.getHttpServer())
        .post('/authentication/login/')
        .send(loginDto)
        .expect(401);
    });

    it('should return 401 if password is incorrect', () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      return request(app.getHttpServer())
        .post('/authentication/login/')
        .send(loginDto)
        .expect(401);
    });
  });

  describe('/authentication/current/ (GET)', () => {
    beforeEach(async () => {
      // Create a user and get a token
      const hashedPassword = await bcrypt.hash('password123', 10);
      await userRepository.save({
        name: 'Test User',
        email: 'test@example.com',
        password: hashedPassword,
      });

      const loginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const response = await request(app.getHttpServer())
        .post('/authentication/login/')
        .send(loginDto);

      jwtToken = response.body.token;
    });

    it('should return the current user when authenticated', () => {
      return request(app.getHttpServer())
        .get('/authentication/current/')
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('name', 'Test User');
          expect(res.body).toHaveProperty('email', 'test@example.com');
          expect(res.body).toHaveProperty('createdAt');
        });
    });

    it('should return 403 when no token is provided', () => {
      return request(app.getHttpServer())
        .get('/authentication/current/')
        .expect(403);
    });

    it('should return 403 when an invalid token is provided', () => {
      return request(app.getHttpServer())
        .get('/authentication/current/')
        .set('Authorization', 'Bearer invalid-token')
        .expect(403);
    });
  });
});
