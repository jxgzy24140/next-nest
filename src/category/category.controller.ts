import { Controller, Get, Query } from '@nestjs/common';
import { CategoryService } from './category.service';
import { ResponseResultDto } from 'src/dto/response.dto';
import { FilterInputDto } from 'src/dto/filter-input.dto';
import { CategoryDto } from './dto/category.dto';

@Controller('category')
export class CategoryController {
  constructor(private categoryService: CategoryService) {}
  @Get()
  getAll(
    @Query() filter: FilterInputDto,
  ): Promise<ResponseResultDto<CategoryDto>> {
    return this.categoryService.getAll(filter);
  }
}
