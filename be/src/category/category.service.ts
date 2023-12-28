import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './entites/category.entity';
import { Repository } from 'typeorm';
import { FilterInputDto } from 'src/dto/filter-input.dto';
import { ResponseResultDto } from 'src/dto/response.dto';
import { CategoryDto } from './dto/category.dto';
import { plainToInstance } from 'class-transformer';
@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  async getAll(
    filter: FilterInputDto,
  ): Promise<ResponseResultDto<CategoryDto>> {
    const items_per_page = Number(filter.items_per_page) || 10;
    const page = Number(filter.page) || 1;
    const [result, total] = await this.categoryRepository.findAndCount({
      order: { createdAt: 'ASC' },
      skip: (page - 1) * items_per_page,
      take: items_per_page,
    });
    const lastPage = Math.ceil(Number(total) / items_per_page);
    const nextPage = page < lastPage ? page + 1 : null;
    const prevPage = page != 1 ? page - 1 : null;
    const response = {
      result: plainToInstance(CategoryDto, result),
      total,
      currentPage: page,
      prevPage,
      nextPage,
    };
    return response;
  }
}
