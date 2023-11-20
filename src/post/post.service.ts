import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Repository, UpdateResult } from 'typeorm';
import { Post } from './entites/post.entity';
import { CreateOrUpdatePostInputDto } from './dto/create-post-input.dto';
import { PostDto } from './dto/post.dto';
import { ResponseResultDto } from 'src/dto/response.dto';
import { FilterPostDto } from './dto/filter-post.dto';
@Injectable()
export class PostService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Post) private postRepository: Repository<Post>,
  ) {}
  async createPost(
    userId: string,
    post: CreateOrUpdatePostInputDto,
  ): Promise<PostDto> {
    const user = await this.userRepository.findOneBy({ id: Number(userId) });
    try {
      const newPost = await this.postRepository.save({ ...post, user });
      return this.getPost(newPost.id);
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  async getPosts(
    id: string,
    filter: FilterPostDto,
  ): Promise<ResponseResultDto<PostDto>> {
    const items_per_page = Number(filter.items_per_page) || 10;
    const page = Number(filter.page) || 1;
    const [result, total] = await this.postRepository.findAndCount({
      order: { createdAt: 'ASC' },
      skip: (page - 1) * items_per_page,
      take: items_per_page,
      relations: ['user', 'category'],
      where: { user: { id: Number(id) } },
      select: {
        user: {
          firstName: true,
          lastName: true,
          email: true,
          avatar: true,
        },
        category: {
          id: true,
          name: true,
        },
      },
    });
    const lastPage = Math.ceil(Number(total) / items_per_page);
    const nextPage = page < lastPage ? page + 1 : null;
    const prevPage = page != 1 ? page - 1 : null;
    const response = {
      result,
      total,
      currentPage: page,
      prevPage,
      nextPage,
    };
    return response;
  }

  async getPost(id: string): Promise<PostDto> {
    const result = await this.postRepository.findOne({
      relations: ['user', 'category'],
      where: { id: id },
      select: {
        user: {
          firstName: true,
          lastName: true,
          email: true,
          avatar: true,
        },
        category: {
          id: true,
          name: true,
        },
      },
    });
    return result;
  }

  async updatePost(
    id: string,
    post: CreateOrUpdatePostInputDto,
  ): Promise<UpdateResult> {
    const postFound = await this.postRepository.findOneBy({ id: id });
    if (!postFound) {
      throw new HttpException('Post not found', HttpStatus.BAD_REQUEST);
    }
    return await this.postRepository.update(id, post);
  }

  async deletePost(id: string): Promise<PostDto> {
    const postFound = await this.postRepository.findOneBy({ id: id });
    if (!postFound) {
      throw new HttpException('Post not found', HttpStatus.BAD_REQUEST);
    }
    await this.postRepository.delete({ id });
    return postFound;
  }

  async uploadPhoto(id: string, photoPath: string): Promise<UpdateResult> {
    return await this.postRepository.update(id, { thumbnail: photoPath });
  }
}
