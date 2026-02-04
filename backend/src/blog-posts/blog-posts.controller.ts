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
@ApiBearerAuth()
@Controller('blog-posts')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BlogPostsController {
  constructor(private readonly blogPostsService: BlogPostsService) {}

  @Get()
  @ApiOperation({ summary: 'List blog posts' })
  listBlogPosts() {
    return this.blogPostsService.findAll();
  }

  @Post()
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Create blog post (draft by default)' })
  createBlogPost(@Body() dto: CreateBlogPostDto, @Req() req: any) {
    return this.blogPostsService.create(dto, req.user?.sub);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update blog post' })
  updateBlogPost(@Param('id') id: string, @Body() dto: UpdateBlogPostDto) {
    return this.blogPostsService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete blog post' })
  deleteBlogPost(@Param('id') id: string) {
    return this.blogPostsService.remove(id);
  }
}
