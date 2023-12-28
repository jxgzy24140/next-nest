import { Module } from '@nestjs/common';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Post } from './entites/post.entity';
import { ConfigModule } from '@nestjs/config';
import { MediaModule } from 'src/media/media.module';

@Module({
  imports: [TypeOrmModule.forFeature([User, Post]), ConfigModule, MediaModule],
  controllers: [PostController],
  providers: [PostService],
})
export class PostModule {}
