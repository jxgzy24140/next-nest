/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3 } from 'aws-sdk';

@Injectable()
export class MediaService {
  private s3: S3;

  constructor(private readonly configService: ConfigService) {
    this.s3 = new S3({
      accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID'),
      secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY'),
      region: this.configService.get<string>('AWS_REGION'),
    });
  }

  async getFile(media_key: string) {
    return this.s3.getSignedUrl('getObject', {
      Key: media_key,
      Bucket: this.configService.get<string>('AWS_PUBLIC_BUCKET_KEY'),
      Expires: 60 * 60 * 12,
    });
  }

  async uploadFile(key: string, body: Buffer, contentType: string) {
    const params = {
      Bucket: this.configService.get<string>('AWS_PUBLIC_BUCKET_KEY'),
      Key: key,
      Body: body,
      ContentType: contentType,
      ACL: 'public-read', // comment if private file
    };
    return this.s3.upload(params).promise();
  }

  async deleteFile(media_key: string): Promise<any> {
    const params = {
      Key: media_key,
      Bucket: this.configService.get<string>('AWS_PUBLIC_BUCKET_KEY'),
    };
    return this.s3.deleteObject(params).promise();
  }

  async updateACL(media_key: string): Promise<any> {
    const params = {
      Key: media_key,
      Bucket: this.configService.get<string>('AWS_PUBLIC_BUCKET_KEY'),
      ACL: 'public-read',
    };
    this.s3.putObjectAcl(
      {
        Bucket: this.configService.get<string>('AWS_PUBLIC_BUCKET_KEY'),
        Key: media_key,
        ACL: 'public-read',
      },
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      (err, data) => {},
    );
    return (
      this.s3.endpoint.protocol +
      '//' +
      this.configService.get<string>('AWS_PUBLIC_BUCKET_KEY') +
      '.' +
      this.s3.endpoint.hostname +
      '/' +
      media_key
    );
  }
}
