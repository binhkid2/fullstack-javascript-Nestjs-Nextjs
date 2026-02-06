import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BlogPost, ContentFormat, PostStatus } from './blog-post.entity';
import { CreateBlogPostDto } from './dto/create-blog-post.dto';
import { UpdateBlogPostDto } from './dto/update-blog-post.dto';

@Injectable()
export class BlogPostsService {
  constructor(
    @InjectRepository(BlogPost)
    private readonly blogPostsRepository: Repository<BlogPost>,
  ) {}

  findAll(): Promise<BlogPost[]> {
    return this.blogPostsRepository.find({
      order: { createdAt: 'DESC' },
      relations: ['author'],
    });
  }

  async findPublished(query: {
    page: number;
    pageSize: number;
    q?: string;
    tags?: string[];
    categories?: string[];
    sort: 'newest' | 'oldest' | 'most_viewed' | 'featured';
  }): Promise<{ items: BlogPost[]; total: number; page: number; pageSize: number }> {
    const qb = this.blogPostsRepository
      .createQueryBuilder('post')
      .where('post.status = :status', { status: PostStatus.PUBLISHED })
      .andWhere('post.slug IS NOT NULL')
      .andWhere("post.slug <> ''");

    if (query.q) {
      qb.andWhere(
        '(post.title ILIKE :q OR post.excerpt ILIKE :q)',
        { q: `%${query.q}%` },
      );
    }

    if (query.tags && query.tags.length > 0) {
      qb.andWhere('post.tags && :tags', { tags: query.tags });
    }

    if (query.categories && query.categories.length > 0) {
      qb.andWhere('post.categories && :categories', {
        categories: query.categories,
      });
    }

    switch (query.sort) {
      case 'oldest':
        qb.orderBy('post.created_at', 'ASC');
        break;
      case 'most_viewed':
        qb.orderBy('post.views', 'DESC').addOrderBy('post.created_at', 'DESC');
        break;
      case 'featured':
        qb.orderBy('post.is_featured', 'DESC').addOrderBy('post.created_at', 'DESC');
        break;
      case 'newest':
      default:
        qb.orderBy('post.created_at', 'DESC');
        break;
    }

    const [items, total] = await qb
      .skip((query.page - 1) * query.pageSize)
      .take(query.pageSize)
      .getManyAndCount();

    return { items, total, page: query.page, pageSize: query.pageSize };
  }

  async findPublishedBySlug(slug: string): Promise<BlogPost> {
    const post = await this.blogPostsRepository
      .createQueryBuilder('post')
      .where('LOWER(post.slug) = LOWER(:slug)', { slug })
      .andWhere('post.status = :status', { status: PostStatus.PUBLISHED })
      .getOne();

    if (!post) {
      throw new NotFoundException('Blog post not found');
    }

    return post;
  }

  findFeatured(limit: number): Promise<BlogPost[]> {
    return this.blogPostsRepository
      .createQueryBuilder('post')
      .where('post.status = :status', { status: PostStatus.PUBLISHED })
      .andWhere('post.slug IS NOT NULL')
      .andWhere("post.slug <> ''")
      .andWhere('post.is_featured = true')
      .orderBy('post.created_at', 'DESC')
      .take(limit)
      .getMany();
  }

  async incrementViewsBySlug(slug: string): Promise<number> {
    await this.blogPostsRepository
      .createQueryBuilder()
      .update(BlogPost)
      .set({ views: () => '"views" + 1' })
      .where('LOWER(slug) = LOWER(:slug)', { slug })
      .andWhere('status = :status', { status: PostStatus.PUBLISHED })
      .execute();

    const post = await this.blogPostsRepository
      .createQueryBuilder('post')
      .where('LOWER(post.slug) = LOWER(:slug)', { slug })
      .getOne();

    if (!post) {
      throw new NotFoundException('Blog post not found');
    }

    return post.views;
  }

  async create(dto: CreateBlogPostDto, authorId?: string): Promise<BlogPost> {
    const post = this.blogPostsRepository.create({
      title: dto.title.trim(),
      slug: dto.slug?.trim() || null,
      excerpt: dto.excerpt?.trim() || null,
      content: dto.content,
      contentFormat: dto.contentFormat ?? ContentFormat.MARKDOWN,
      status: PostStatus.DRAFT,
      authorId: authorId ?? null,
      featuredImage: dto.featuredImage ?? null,
      isFeatured: dto.isFeatured ?? false,
      categories: dto.categories ?? [],
      tags: dto.tags ?? [],
      views: 0,
    });

    return this.blogPostsRepository.save(post);
  }

  async update(id: string, dto: UpdateBlogPostDto): Promise<BlogPost> {
    const post = await this.blogPostsRepository.findOne({ where: { id } });

    if (!post) {
      throw new NotFoundException('Blog post not found');
    }

    if (dto.title !== undefined) {
      post.title = dto.title.trim();
    }

    if (dto.slug !== undefined) {
      post.slug = dto.slug?.trim() || null;
    }

    if (dto.excerpt !== undefined) {
      post.excerpt = dto.excerpt?.trim() || null;
    }

    if (dto.content !== undefined) {
      post.content = dto.content;
    }

    if (dto.contentFormat !== undefined) {
      post.contentFormat = dto.contentFormat;
    }

    if (dto.status !== undefined) {
      post.status = dto.status;
    }

    if (dto.isFeatured !== undefined) {
      post.isFeatured = dto.isFeatured;
    }

    if (dto.featuredImage !== undefined) {
      post.featuredImage = dto.featuredImage ?? null;
    }

    if (dto.categories !== undefined) {
      post.categories = dto.categories;
    }

    if (dto.tags !== undefined) {
      post.tags = dto.tags;
    }

    return this.blogPostsRepository.save(post);
  }

  async remove(id: string): Promise<{ deleted: true }> {
    const result = await this.blogPostsRepository.delete(id);

    if (!result.affected) {
      throw new NotFoundException('Blog post not found');
    }

    return { deleted: true };
  }
}
