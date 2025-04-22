import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ArticleController } from './article.controller';
import { ArticleService } from './article.service';
import { PaginationRequestDTO } from '@common/dto/pagination.request.dto';
import { ArticleItemDTO } from './dto/article.item.dto';
import { ArticleIDDTO } from './dto/article.id.dto';
import { ArticleCreateDTO } from './dto/article.create.dto';
import { ArticleUpdateDTO } from './dto/article.update.dto';
import { AuthUserItemDTO } from '@modules/auth/dto/auth.user-item.dto';
import { AuthGuard } from '@modules/auth/auth.guard';
import { AuthService } from '@modules/auth/auth.service';
import { CacheModule, CACHE_MANAGER } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '@liaoliaots/nestjs-redis';
import { RootCacheInterceptor } from '@common/interceptor/root.cache-interceptor.service';

describe('ArticleController', () => {
  let controller: ArticleController;
  let service: ArticleService;

  const testUser: AuthUserItemDTO = {
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
    createdAt: new Date(),
  };

  const mockArticleService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    exists: jest.fn(),
    create: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  };

  const mockAuthService = {
    current: jest.fn().mockResolvedValue(testUser),
  };

  const mockRedisService = {
    getOrThrow: jest.fn().mockReturnValue({
      keys: jest.fn().mockResolvedValue([]),
      unlink: jest.fn().mockResolvedValue(true),
    }),
  };

  const mockConfigService = {
    get: jest.fn().mockImplementation((key) => {
      if (key === 'CACHE_REDIS_NAMESPACE') return 'test';
      if (key === 'CACHE_REDIS_TTL') return 60;
      return null;
    }),
  };

  const mockCacheManager = {
    get: jest.fn(),
    set: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ArticleController],
      providers: [
        {
          provide: ArticleService,
          useValue: mockArticleService,
        },
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
        {
          provide: RedisService,
          useValue: mockRedisService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        RootCacheInterceptor,
        AuthGuard,
      ],
    }).compile();

    controller = module.get<ArticleController>(ArticleController);
    service = module.get<ArticleService>(ArticleService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated articles', async () => {
      const query: PaginationRequestDTO = {
        page: 0,
        limit: 10,
        search: 'test',
      };
      const mockArticles: ArticleItemDTO[] = [
        {
          id: 1,
          title: 'Test Article 1',
          description: 'Test Description 1',
          author: { id: 1, name: 'Test Author' },
          createdAt: new Date(),
        },
        {
          id: 2,
          title: 'Test Article 2',
          description: 'Test Description 2',
          author: { id: 1, name: 'Test Author' },
          createdAt: new Date(),
        },
      ];
      const count = 2;

      mockArticleService.findAll.mockResolvedValue([mockArticles, count]);

      const result = await controller.findAll(query);

      expect(service.findAll).toHaveBeenCalledWith(0, 10, 'test');
      expect(result.data).toEqual(mockArticles);
      expect(result.total).toEqual(count);
      expect(result.page).toEqual(0);
      expect(result.total).toEqual(count);
    });
  });

  describe('findOne', () => {
    it('should return an article by id', async () => {
      const query: ArticleIDDTO = { id: 1 };
      const mockArticle: ArticleItemDTO = {
        id: 1,
        title: 'Test Article',
        description: 'Test Description',
        author: { id: 1, name: 'Test Author' },
        createdAt: new Date(),
      };

      mockArticleService.exists.mockResolvedValue(true);
      mockArticleService.findOne.mockResolvedValue(mockArticle);

      const result = await controller.findOne(query);

      expect(service.exists).toHaveBeenCalledWith(1);
      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockArticle);
    });

    it('should throw NotFoundException when article does not exist', async () => {
      const query: ArticleIDDTO = { id: 999 };

      mockArticleService.exists.mockResolvedValue(false);

      await expect(controller.findOne(query)).rejects.toThrow(
        NotFoundException,
      );
      expect(service.exists).toHaveBeenCalledWith(999);
      expect(service.findOne).not.toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('should create a new article', async () => {
      // Using the testUser defined at the top of the test suite
      const createDto: ArticleCreateDTO = {
        title: 'New Article',
        description: 'New Description',
      };
      const mockArticle: ArticleItemDTO = {
        id: 1,
        title: 'New Article',
        description: 'New Description',
        author: { id: 1, name: 'Test User' },
        createdAt: new Date(),
      };

      mockArticleService.create.mockResolvedValue(mockArticle);

      const result = await controller.create(testUser, createDto);

      expect(service.create).toHaveBeenCalledWith(1, createDto);
      expect(result).toEqual(mockArticle);
    });
  });

  describe('update', () => {
    it('should update an article', async () => {
      // Using the testUser defined at the top of the test suite
      const query: ArticleIDDTO = { id: 1 };
      const updateDto: ArticleCreateDTO = {
        title: 'Updated Article',
        description: 'Updated Description',
      };
      const mockArticle: ArticleItemDTO = {
        id: 1,
        title: 'Updated Article',
        description: 'Updated Description',
        author: { id: 1, name: 'Test User' },
        createdAt: new Date(),
      };

      mockArticleService.patch.mockResolvedValue(mockArticle);

      const result = await controller.update(testUser, query, updateDto);

      expect(service.patch).toHaveBeenCalledWith(1, 1, updateDto);
      expect(result).toEqual(mockArticle);
    });

    it('should pass through NotFoundException when article does not exist', async () => {
      // Using the testUser defined at the top of the test suite
      const query: ArticleIDDTO = { id: 999 };
      const updateDto: ArticleCreateDTO = {
        title: 'Updated Article',
        description: 'Updated Description',
      };

      const notFoundError = new NotFoundException('Article not found');
      mockArticleService.patch.mockRejectedValue(notFoundError);

      await expect(controller.update(testUser, query, updateDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(service.patch).toHaveBeenCalledWith(1, 999, updateDto);
    });
  });

  describe('patch', () => {
    it('should partially update an article', async () => {
      // Using the testUser defined at the top of the test suite
      const query: ArticleIDDTO = { id: 1 };
      const patchDto: ArticleUpdateDTO = {
        title: 'Patched Title',
      };
      const mockArticle: ArticleItemDTO = {
        id: 1,
        title: 'Patched Title',
        description: 'Original Description',
        author: { id: 1, name: 'Test User' },
        createdAt: new Date(),
      };

      mockArticleService.patch.mockResolvedValue(mockArticle);

      const result = await controller.patch(testUser, query, patchDto);

      expect(service.patch).toHaveBeenCalledWith(1, 1, patchDto);
      expect(result).toEqual(mockArticle);
    });

    it('should pass through NotFoundException when article does not exist', async () => {
      // Using the testUser defined at the top of the test suite
      const query: ArticleIDDTO = { id: 999 };
      const patchDto: ArticleUpdateDTO = {
        title: 'Patched Title',
      };

      const notFoundError = new NotFoundException('Article not found');
      mockArticleService.patch.mockRejectedValue(notFoundError);

      await expect(controller.patch(testUser, query, patchDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(service.patch).toHaveBeenCalledWith(1, 999, patchDto);
    });
  });

  describe('delete', () => {
    it('should delete an article', async () => {
      // Using the testUser defined at the top of the test suite
      const query: ArticleIDDTO = { id: 1 };
      const mockArticle: ArticleItemDTO = {
        id: 1,
        title: 'Test Article',
        description: 'Test Description',
        author: { id: 1, name: 'Test User' },
        createdAt: new Date(),
      };

      mockArticleService.delete.mockResolvedValue(mockArticle);

      const result = await controller.delete(testUser, query);

      expect(service.delete).toHaveBeenCalledWith(1, 1);
      expect(result).toEqual(mockArticle);
    });

    it('should pass through NotFoundException when article does not exist', async () => {
      // Using the testUser defined at the top of the test suite
      const query: ArticleIDDTO = { id: 999 };

      const notFoundError = new NotFoundException('Article not found');
      mockArticleService.delete.mockRejectedValue(notFoundError);

      await expect(controller.delete(testUser, query)).rejects.toThrow(
        NotFoundException,
      );
      expect(service.delete).toHaveBeenCalledWith(1, 999);
    });
  });
});
