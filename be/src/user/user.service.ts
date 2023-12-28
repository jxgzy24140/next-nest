import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Like, Repository, UpdateResult } from 'typeorm';
import { UpdateUserDto } from './dto/update-user.dto';
import { FilterUserDto } from './dto/filter-user.dto';
import { ResponseResultDto } from 'src/dto/response.dto';
import { UserDto } from './dto/user.dto';
import { AuthService } from 'src/auth/auth.service';
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private readonly authService: AuthService,
  ) {}

  async getAll(filter: FilterUserDto): Promise<ResponseResultDto<User>> {
    const items_per_page = Number(filter.items_per_page) || 10;
    const search_query = filter.search_query || '';
    const page = Number(filter.page) || 1;
    const [result, total] = await this.userRepository.findAndCount({
      // order: { createdAt: 'ASC' },
      skip: (page - 1) * items_per_page,
      take: items_per_page,
      where: [
        {
          firstName: Like(`%${search_query}%`),
        },
        {
          lastName: Like(`%${search_query}%`),
        },
        {
          email: Like(`%${search_query}%`),
        },
      ],
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

  async getUser(id: string): Promise<UserDto> {
    const user = await this.userRepository.findOneBy({ id: Number(id) });
    if (!user) {
      throw new HttpException('User not found!', HttpStatus.NOT_FOUND);
    }
    // eslint-disable-next-line prettier/prettier, @typescript-eslint/no-unused-vars
    const { password, ...data } = user;
    return data;
  }

  async updateUser(id: string, user: UpdateUserDto): Promise<UpdateResult> {
    const isExisted = await this.userRepository.findOneBy({ id: Number(id) });
    if (!isExisted) {
      throw new HttpException('User not found', HttpStatus.BAD_REQUEST);
    }
    return await this.userRepository.update(id, user);
  }

  async deleteUser(id: string): Promise<User> {
    const user = await this.userRepository.findOneBy({ id: Number(id) });
    if (!user) {
      throw new HttpException('User not found', HttpStatus.BAD_REQUEST);
    }
    await this.userRepository.delete(id);
    return user;
  }

  async updateAvatar(id: string, avatarPath: string): Promise<UpdateResult> {
    return await this.userRepository.update(id, { avatar: avatarPath });
  }

  async decodeToken(token: string): Promise<any> {
    try {
      const decodedToken: any = await this.authService.handleVerifyToken(token);
      const user = await this.userRepository.findOneBy({ id: decodedToken.id });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...data } = user;
      console.log(data);
      return data;
    } catch (error) {
      console.log(error);
      throw new HttpException('Invalid token', HttpStatus.BAD_REQUEST);
    }
  }
}
