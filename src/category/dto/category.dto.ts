import { Post } from 'src/post/entites/post.entity';

export class CategoryDto {
  id: string;
  name: string;
  description: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  posts: Post[];
}
