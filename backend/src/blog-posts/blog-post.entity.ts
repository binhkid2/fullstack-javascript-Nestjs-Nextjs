import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

export enum PostStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

export enum ContentFormat {
  MARKDOWN = 'markdown',
  HTML = 'html',
}

@Entity('blog_posts')
@Index('idx_blog_posts_status_created_at', ['status', 'createdAt'])
@Index('idx_blog_posts_published_at', ['publishedAt'])
@Check(
  'blog_posts_published_at_required',
  `"status" <> 'published' OR "published_at" IS NOT NULL`,
)
@Check(
  'blog_posts_content_format_valid',
  `"content_format" IN ('markdown', 'html')`,
)
export class BlogPost {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'varchar', length: 255, unique: true, nullable: true })
  slug?: string | null;

  @Column({
    type: 'enum',
    enum: PostStatus,
    enumName: 'post_status',
    default: PostStatus.DRAFT,
  })
  status!: PostStatus;

  @Column({ type: 'varchar', length: 500, nullable: true })
  excerpt?: string | null;

  @Column({ type: 'text' })
  content!: string;

  @Column({
    name: 'content_format',
    type: 'varchar',
    length: 20,
    default: ContentFormat.MARKDOWN,
  })
  contentFormat!: ContentFormat;

  @Column({ name: 'author_id', type: 'uuid', nullable: true })
  authorId?: string | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'author_id' })
  author?: User | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @Column({ name: 'published_at', type: 'timestamptz', nullable: true })
  publishedAt?: Date | null;
}
