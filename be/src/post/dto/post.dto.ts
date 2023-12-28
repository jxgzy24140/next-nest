import { Category } from 'src/category/entites/category.entity';
import { User } from 'src/user/entities/user.entity';

export class PostDto {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  status: number;
  user: User;
  category: Category;
  createdAt: Date;
  updatedAt: Date;
}
