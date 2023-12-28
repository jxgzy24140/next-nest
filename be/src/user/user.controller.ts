import {
  Controller,
  Get,
  Put,
  Post,
  UseGuards,
  Param,
  Body,
  Query,
  Req,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  Delete,
  SetMetadata,
} from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { AuthGuard } from 'src/auth/auth.guard';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateResult } from 'typeorm';
import { FilterUserDto } from './dto/filter-user.dto';
import { ResponseResultDto } from 'src/dto/response.dto';
import { ApiBearerAuth, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { storageConfig } from 'helpers/config';
import { extname } from 'path';
import { UserDto } from './dto/user.dto';
import { MediaService } from 'src/media/media.service';

@UseGuards(AuthGuard)
@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly mediaService: MediaService,
  ) {}
  @ApiQuery({ name: 'page' })
  @SetMetadata('roles', [0, 1])
  @ApiQuery({ name: 'items_per_page' })
  @ApiResponse({ status: 200, description: 'Successfully!' })
  @Get()
  getAll(@Query() filter: FilterUserDto): Promise<ResponseResultDto<User>> {
    return this.userService.getAll(filter);
  }

  @Get('/:id')
  @SetMetadata('roles', [0, 1])
  @ApiResponse({ status: 200, description: 'Successfully!' })
  @ApiResponse({ status: 404, description: 'User is not found!' })
  getUser(@Param('id') id: string): Promise<UserDto> {
    return this.userService.getUser(id);
  }

  @Put(':id')
  @SetMetadata('roles', [0, 1])
  @UseInterceptors(FileInterceptor('avatar'))
  @ApiResponse({ status: 200, description: 'Successfully!' })
  @ApiResponse({ status: 404, description: 'User is not found!' })
  async updateUser(
    @Param('id') id: string,
    @Body() user: UpdateUserDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<UpdateResult> {
    if (file) {
      user.avatar = `${Date.now()}-${file.originalname}`;
      const { buffer, mimetype } = file;
      await this.mediaService.uploadFile(user.avatar, buffer, mimetype);
    }
    return this.userService.updateUser(id, user);
  }

  @Delete('/:id')
  @SetMetadata('roles', [0, 1])
  deleteUser(@Param('id') id: string): Promise<UserDto> {
    return this.userService.deleteUser(id);
  }

  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: storageConfig('avatar'),
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
  @Post('upload-avatar')
  uploadAvatar(@Req() req: any, @UploadedFile() file: Express.Multer.File) {
    if (req.fileValidationError) {
      throw new BadRequestException(req.fileValidationError);
    }
    if (!file) {
      throw new BadRequestException('File is required');
    }
    return this.userService.updateAvatar(req.user.id, `/${file.filename}`);
  }

  @Post('/get-user-by-token')
  @SetMetadata('roles', [0, 1])
  async getUserByToken(@Body('access_token') access_token: string) {
    if (access_token && access_token.split(' ')[1]) {
      return await this.userService.decodeToken(access_token.split(' ')[1]);
    }
    return false;
  }
}
