import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { Role } from '../roles/role.enum';
import { BlogPostsService } from './blog-posts.service';
import { CreateBlogPostDto } from './dto/create-blog-post.dto';
import { UpdateBlogPostDto } from './dto/update-blog-post.dto';
import { PublicBlogPostsQueryDto } from './dto/public-blog-posts-query.dto';

@ApiTags('blog-posts')
@Controller('blog-posts')
export class BlogPostsController {
  constructor(private readonly blogPostsService: BlogPostsService) {}

  @Get('public')
  @ApiOperation({ summary: 'List published blog posts' })
  listPublishedBlogPosts(@Query() query: PublicBlogPostsQueryDto) {
    const page = query.page ?? 1;
    const pageSize = Math.min(query.pageSize ?? 12, 50);
    const q = query.q?.trim() || undefined;
    const tags = query.tags
      ? query.tags.split(',').map((item) => item.trim()).filter(Boolean)
      : undefined;
    const categories = query.category
      ? query.category.split(',').map((item) => item.trim()).filter(Boolean)
      : undefined;
    const sort = query.sort ?? 'newest';

    return this.blogPostsService.findPublished({
      page,
      pageSize,
      q,
      tags,
      categories,
      sort,
    });
  }

  @Get('public/featured')
  @ApiOperation({ summary: 'List featured published blog posts' })
  listFeaturedBlogPosts(@Query('limit') limit?: string) {
    const parsed = parseInt(limit ?? '6', 10);
    const safeLimit = Number.isNaN(parsed) ? 6 : Math.min(parsed, 12);
    return this.blogPostsService.findFeatured(safeLimit);
  }

  @Get('public/:slug')
  @ApiOperation({ summary: 'Get published blog post by slug' })
  getPublishedBlogPost(@Param('slug') slug: string) {
    return this.blogPostsService.findPublishedBySlug(slug);
  }

  @Post('public/:slug/view')
  @ApiOperation({ summary: 'Increment view count for a published post' })
  incrementViews(@Param('slug') slug: string) {
    return this.blogPostsService.incrementViewsBySlug(slug).then((views) => ({
      views,
    }));
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List blog posts' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  listBlogPosts() {
    return this.blogPostsService.findAll();
  }

  @Post()
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create blog post (draft by default)' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  createBlogPost(@Body() dto: CreateBlogPostDto, @Req() req: any) {
    return this.blogPostsService.create(dto, req.user?.sub);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update blog post' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  updateBlogPost(@Param('id') id: string, @Body() dto: UpdateBlogPostDto) {
    return this.blogPostsService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete blog post' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  deleteBlogPost(@Param('id') id: string) {
    return this.blogPostsService.remove(id);
  }
}
