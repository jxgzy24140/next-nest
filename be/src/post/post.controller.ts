import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Req,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  BadRequestException,
  UploadedFile,
  SetMetadata,
} from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { extname } from 'path';
import { FileInterceptor } from '@nestjs/platform-express';
import { PostService } from './post.service';
import { PostDto } from './dto/post.dto';
import { FilterPostDto } from './dto/filter-post.dto';
import { ResponseResultDto } from 'src/dto/response.dto';
import { ApiBearerAuth, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateOrUpdatePostInputDto } from './dto/create-post-input.dto';
import { MediaService } from 'src/media/media.service';

@UseGuards(AuthGuard)
@ApiBearerAuth()
@ApiTags('Posts')
@Controller('posts')
export class PostController {
  constructor(
    private readonly postService: PostService,
    private readonly mediaService: MediaService,
  ) {}

  @Post()
  @SetMetadata('roles', [0, 1])
  @UseInterceptors(
    FileInterceptor('thumbnail', {
      // storage: storageConfig('posts'),
      fileFilter: (req, file, cb) => {
        const allowedExt = ['.jpg', '.png', '.jpeg'];
        const ext = extname(file.originalname);

        if (!allowedExt.includes(ext)) {
          req.fileValidationError = `The file is not valid, accepted file extension are ${allowedExt.toString()}`;
          cb(null, false);
        } else {
          const acceptedFileSize = 1024 * 1024 * 10;
          const fileSize = parseInt(req.headers['content-length']);
          if (fileSize > acceptedFileSize) {
            req.fileValidationError = `The file is so large, accepted file less than ${acceptedFileSize} MB`;
            cb(null, false);
          } else {
            cb(null, true);
          }
        }
      },
    }),
  )
  async createPost(
    @Req() req: any,
    @Body() body: CreateOrUpdatePostInputDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const post = {
      ...body,
      thumbnail: '',
    } as any;
    if (req.fileValidationError) {
      throw new BadRequestException(req.fileValidationError);
    }
    if (file) {
      post.thumbnail = `${Date.now()}-${file.originalname}`;
      const { buffer, mimetype } = file;
      await this.mediaService.uploadFile(post.thumbnail, buffer, mimetype);
    }
    return this.postService.createPost(req.user.id, post);
  }

  @Get()
  @SetMetadata('roles', [0, 1])
  @ApiQuery({ name: 'page' })
  @ApiQuery({ name: 'items_per_page' })
  @ApiResponse({ status: 200, description: 'Successfully!' })
  getPosts(
    @Req() req: any,
    @Query() filter: FilterPostDto,
  ): Promise<ResponseResultDto<PostDto>> {
    return this.postService.getPosts(req.user.id, filter);
  }

  @Get(':id')
  @SetMetadata('roles', [0, 1])
  getPost(@Param('id') id: string): Promise<PostDto> {
    return this.postService.getPost(id);
  }

  @Put(':id')
  @SetMetadata('roles', [0, 1])
  @UseInterceptors(
    FileInterceptor('thumbnail', {
      fileFilter: (req, file, cb) => {
        const allowedExt = ['.jpg', '.png', '.jpeg'];
        const ext = extname(file.originalname);

        if (!allowedExt.includes(ext)) {
          req.fileValidationError = `The file is not valid, accepted file extension are ${allowedExt.toString()}`;
          cb(null, false);
        } else {
          const acceptedFileSize = 1024 * 1024 * 5;
          const fileSize = parseInt(req.headers['content-length']);
          if (fileSize > acceptedFileSize) {
            req.fileValidationError = `The file is so large, accepted file less than ${acceptedFileSize} MB`;
            cb(null, false);
          } else {
            cb(null, true);
          }
        }
      },
    }),
  )
  async updatePost(
    @Param('id') id: string,
    @Req() req: any,
    @Body() body: CreateOrUpdatePostInputDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (req.fileValidationError) {
      throw new BadRequestException(req.fileValidationError);
    }
    if (file) {
      body.thumbnail = `${Date.now()}-${file.originalname}`;
      const { buffer, mimetype } = file;
      await this.mediaService.uploadFile(body.thumbnail, buffer, mimetype);
    }
    return this.postService.updatePost(id, body);
  }

  @Delete(':id')
  @SetMetadata('roles', [0, 1])
  deletPost(@Param('id') id: string): Promise<PostDto> {
    return this.postService.deletePost(id);
  }

  @UseInterceptors(
    FileInterceptor('thumbnail', {
      fileFilter: (req, file, cb) => {
        const allowedExt = ['.jpg', '.png', '.jpeg'];
        const ext = extname(file.originalname);

        if (!allowedExt.includes(ext)) {
          req.fileValidationError = `The file is not valid, accepted file extension are ${allowedExt.toString()}`;
          cb(null, false);
        } else {
          const acceptedFileSize = 1024 * 1024 * 5;
          const fileSize = parseInt(req.headers['content-length']);
          if (fileSize > acceptedFileSize) {
            req.fileValidationError = `The file is so large, accepted file less than ${acceptedFileSize} MB`;
            cb(null, false);
          } else {
            cb(null, true);
          }
        }
      },
    }),
  )
  @Post('upload-thumbnail')
  @SetMetadata('roles', [0, 1])
  uploadAvatar(@Req() req: any, @UploadedFile() file: Express.Multer.File) {
    if (req.fileValidationError) {
      throw new BadRequestException(req.fileValidationError);
    }
    if (!file) {
      throw new BadRequestException('File is required');
    }
    return this.postService.uploadPhoto(req.user.id, file.originalname);
  }
}
