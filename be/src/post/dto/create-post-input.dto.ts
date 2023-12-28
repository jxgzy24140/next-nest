import { Category } from 'src/category/entites/category.entity';
import { User } from 'src/user/entities/user.entity';

export class CreateOrUpdatePostInputDto {
  id?: string;
  title: string;
  description: string;
  thumbnail: string;
  status: number;
  category: Category;
  user: User;
}
