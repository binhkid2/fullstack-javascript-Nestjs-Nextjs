import {
  IsArray,
  IsEnum,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { ContentFormat, FeaturedImage, PostStatus } from '../blog-post.entity';
import { Type } from 'class-transformer';

class FeaturedImageDto implements FeaturedImage {
  @IsString()
  @IsOptional()
  id!: string;

  @IsString()
  @IsOptional()
  url!: string;

  @IsOptional()
  @IsString()
  alt?: string | null;
}

export class UpdateBlogPostDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  slug?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  excerpt?: string | null;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsEnum(ContentFormat)
  contentFormat?: ContentFormat;

  @IsOptional()
  @IsEnum(PostStatus)
  status?: PostStatus;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => FeaturedImageDto)
  featuredImage?: FeaturedImageDto | null;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categories?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
