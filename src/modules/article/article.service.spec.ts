import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';

import { ArticleService } from './article.service';
import { ArticleEntity } from '@common/entities/article.entity';
import { ArticleCreateDTO } from './dto/article.create.dto';
import { ArticleUpdateDTO } from './dto/article.update.dto';

describe('ArticleService', () => {
  let service: ArticleService;
  let queryBuilderMock: any;

  beforeEach(() => {
    // Create a mock for the query builder with all the methods used in the service
    queryBuilderMock = {
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      setParameter: jest.fn().mockReturnThis(),
      leftJoin: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      offset: jest.fn().mockReturnThis(),
      getExists: jest.fn(),
      getOne: jest.fn(),
      getManyAndCount: jest.fn(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      values: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      execute: jest.fn().mockResolvedValue({ identifiers: [{ id: 1 }] }),
    };
  });

  const mockRepository = () => ({
    createQueryBuilder: jest.fn().mockReturnValue(queryBuilderMock),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ArticleService,
        {
          provide: getRepositoryToken(ArticleEntity),
          useFactory: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ArticleService>(ArticleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('exists', () => {
    it('should check if an article exists by id', async () => {
      queryBuilderMock.getExists.mockResolvedValue(true);

      const result = await service.exists(1);

      expect(queryBuilderMock.where).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should check if an article exists by id and executorId', async () => {
      queryBuilderMock.getExists.mockResolvedValue(true);

      const result = await service.exists(1, 2);

      expect(queryBuilderMock.where).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should return false if article does not exist', async () => {
      queryBuilderMock.getExists.mockResolvedValue(false);

      const result = await service.exists(999);

      expect(queryBuilderMock.where).toHaveBeenCalled();
      expect(result).toBe(false);
    });
  });

  describe('findAll', () => {
    it('should return all articles with pagination', async () => {
      const mockArticles = [
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

      queryBuilderMock.getManyAndCount.mockResolvedValue([mockArticles, 2]);

      const result = await service.findAll(0, 10);

      expect(queryBuilderMock.select).toHaveBeenCalled();
      expect(queryBuilderMock.addSelect).toHaveBeenCalledWith([
        'author.id',
        'author.name',
      ]);
      expect(queryBuilderMock.leftJoin).toHaveBeenCalledWith(
        'article.author',
        'author',
      );
      expect(queryBuilderMock.limit).toHaveBeenCalledWith(10);
      expect(queryBuilderMock.offset).toHaveBeenCalledWith(0);
      expect(result).toEqual([mockArticles, 2]);
    });

    it('should return filtered articles when search term is provided', async () => {
      const mockArticles = [
        {
          id: 1,
          title: 'Test Article',
          description: 'Test Description',
          author: { id: 1, name: 'Test Author' },
          createdAt: new Date(),
        },
      ];

      queryBuilderMock.getManyAndCount.mockResolvedValue([mockArticles, 1]);

      const result = await service.findAll(0, 10, 'Test');

      expect(queryBuilderMock.where).toHaveBeenCalled();
      expect(queryBuilderMock.setParameter).toHaveBeenCalledWith(
        'search',
        '%Test%',
      );
      expect(result).toEqual([mockArticles, 1]);
    });
  });

  describe('findOne', () => {
    it('should return an article by id', async () => {
      const mockArticle = {
        id: 1,
        title: 'Test Article',
        description: 'Test Description',
        author: { id: 1, name: 'Test Author' },
        createdAt: new Date(),
      };

      queryBuilderMock.getOne.mockResolvedValue(mockArticle);

      const result = await service.findOne(1);

      expect(queryBuilderMock.addSelect).toHaveBeenCalledWith([
        'author.id',
        'author.name',
      ]);
      expect(queryBuilderMock.leftJoin).toHaveBeenCalledWith(
        'article.author',
        'author',
      );
      expect(queryBuilderMock.where).toHaveBeenCalledWith('article.id = :id', {
        id: 1,
      });
      expect(result).toEqual(mockArticle);
    });
  });

  describe('create', () => {
    it('should create a new article', async () => {
      const createDto: ArticleCreateDTO = {
        title: 'New Article',
        description: 'New Description',
      };

      const mockArticle = {
        id: 1,
        title: 'New Article',
        description: 'New Description',
        author: { id: 1, name: 'Test Author' },
        createdAt: new Date(),
      };

      queryBuilderMock.getOne.mockResolvedValue(mockArticle);

      const result = await service.create(1, createDto);

      expect(queryBuilderMock.values).toHaveBeenCalledWith({
        title: createDto.title,
        description: createDto.description,
        authorId: 1,
      });
      expect(queryBuilderMock.execute).toHaveBeenCalled();
      expect(result).toEqual(mockArticle);
    });
  });

  describe('patch', () => {
    it('should update an article', async () => {
      const updateDto: ArticleUpdateDTO = {
        title: 'Updated Title',
        description: 'Updated Description',
      };

      const mockArticle = {
        id: 1,
        title: 'Updated Title',
        description: 'Updated Description',
        author: { id: 1, name: 'Test Author' },
        createdAt: new Date(),
      };

      // Mock exists method to return true
      jest.spyOn(service, 'exists').mockResolvedValue(true);
      queryBuilderMock.getOne.mockResolvedValue(mockArticle);

      const result = await service.patch(1, 1, updateDto);

      expect(service.exists).toHaveBeenCalledWith(1, 1);
      expect(queryBuilderMock.set).toHaveBeenCalledWith({
        title: updateDto.title,
        description: updateDto.description,
      });
      expect(queryBuilderMock.where).toHaveBeenCalledWith('id = :id', {
        id: 1,
      });
      expect(queryBuilderMock.andWhere).toHaveBeenCalledWith(
        'authorId = :executorId',
        { executorId: 1 },
      );
      expect(queryBuilderMock.execute).toHaveBeenCalled();
      expect(result).toEqual(mockArticle);
    });

    it('should throw NotFoundException when article does not exist', async () => {
      const updateDto: ArticleUpdateDTO = {
        title: 'Updated Title',
      };

      // Mock exists method to return false
      jest.spyOn(service, 'exists').mockResolvedValue(false);

      await expect(service.patch(1, 999, updateDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(service.exists).toHaveBeenCalledWith(999, 1);
    });

    it('should update only provided fields', async () => {
      const updateDto: ArticleUpdateDTO = {
        title: 'Updated Title',
      };

      const mockArticle = {
        id: 1,
        title: 'Updated Title',
        description: 'Original Description',
        author: { id: 1, name: 'Test Author' },
        createdAt: new Date(),
      };

      // Mock exists method to return true
      jest.spyOn(service, 'exists').mockResolvedValue(true);
      queryBuilderMock.getOne.mockResolvedValue(mockArticle);

      const result = await service.patch(1, 1, updateDto);

      expect(service.exists).toHaveBeenCalledWith(1, 1);
      expect(queryBuilderMock.set).toHaveBeenCalledWith({
        title: updateDto.title,
      });
      expect(result).toEqual(mockArticle);
    });
  });

  describe('delete', () => {
    it('should delete an article', async () => {
      const mockArticle = {
        id: 1,
        title: 'Test Article',
        description: 'Test Description',
        author: { id: 1, name: 'Test Author' },
        createdAt: new Date(),
      };

      // Mock exists method to return true
      jest.spyOn(service, 'exists').mockResolvedValue(true);
      queryBuilderMock.getOne.mockResolvedValue(mockArticle);

      const result = await service.delete(1, 1);

      expect(service.exists).toHaveBeenCalledWith(1, 1);
      expect(queryBuilderMock.delete).toHaveBeenCalled();
      expect(queryBuilderMock.where).toHaveBeenCalledWith('id = :id', {
        id: 1,
      });
      expect(queryBuilderMock.execute).toHaveBeenCalled();
      expect(result).toEqual(mockArticle);
    });

    it('should throw NotFoundException when article does not exist', async () => {
      // Mock exists method to return false
      jest.spyOn(service, 'exists').mockResolvedValue(false);

      await expect(service.delete(1, 999)).rejects.toThrow(NotFoundException);
      expect(service.exists).toHaveBeenCalledWith(999, 1);
    });
  });
});
