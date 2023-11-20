import { Post } from 'src/post/entites/post.entity';

export class UserDto {
  id: number;

  firstName: string;

  lastName: string;

  email: string;

  refreshToken: string;

  avatar: string;

  status: number;

  createdAt: Date;

  updatedAt: Date;

  posts: Post[];
}
