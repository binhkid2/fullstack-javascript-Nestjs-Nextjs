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

  findPublished(): Promise<BlogPost[]> {
    return this.blogPostsRepository
      .createQueryBuilder('post')
      .where('post.status = :status', { status: PostStatus.PUBLISHED })
      .andWhere('post.slug IS NOT NULL')
      .andWhere("post.slug <> ''")
      .orderBy('post.created_at', 'DESC')
      .getMany();
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
      categories: dto.categories ?? [],
      tags: dto.tags ?? [],
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
