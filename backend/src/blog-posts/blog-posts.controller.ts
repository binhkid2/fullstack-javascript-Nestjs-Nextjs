import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
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

@ApiTags('blog-posts')
@Controller('blog-posts')
export class BlogPostsController {
  constructor(private readonly blogPostsService: BlogPostsService) {}

  @Get('public')
  @ApiOperation({ summary: 'List published blog posts' })
  listPublishedBlogPosts() {
    return this.blogPostsService.findPublished();
  }

  @Get('public/:slug')
  @ApiOperation({ summary: 'Get published blog post by slug' })
  getPublishedBlogPost(@Param('slug') slug: string) {
    return this.blogPostsService.findPublishedBySlug(slug);
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
