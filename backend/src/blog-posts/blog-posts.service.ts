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
    });
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

    if (dto.publishedAt !== undefined) {
      post.publishedAt = dto.publishedAt ? new Date(dto.publishedAt) : null;
    }

    if (post.status === PostStatus.PUBLISHED && !post.publishedAt) {
      post.publishedAt = new Date();
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
