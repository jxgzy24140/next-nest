import {
  Controller,
  Post,
  Get,
  SetMetadata,
  UploadedFile,
  UseInterceptors,
  Param,
  Query,
  Delete,
  Put,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { MediaService } from './media.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('s3')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Get()
  @SetMetadata('roles', [0, 1])
  async getFile(@Query('media_key') media_key: string) {
    return await this.mediaService.getFile(media_key);
  }

  @Post()
  @SetMetadata('roles', [0, 1])
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@Req() req: any, @UploadedFile() file: Express.Multer.File) {
    if (req.fileValidationError) {
      throw new BadRequestException(req.fileValidationError);
    }
    if (!file) {
      throw new BadRequestException('File is required');
    }
    const { buffer, mimetype } = file;
    const key = `${Date.now()}-${file.originalname}`;
    const result = await this.mediaService.uploadFile(key, buffer, mimetype);
    return result;
  }

  @Delete(':media_key')
  @SetMetadata('roles', [0, 1])
  async deleteFile(@Param('media_key') media_key: string): Promise<boolean> {
    console.log(media_key);

    return await this.mediaService.deleteFile(media_key);
  }

  @Put()
  @SetMetadata('roles', [0, 1])
  async updateACL(@Query('media_key') media_key: string): Promise<any> {
    return this.mediaService.updateACL(media_key);
  }
}
