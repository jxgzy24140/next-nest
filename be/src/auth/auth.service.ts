import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import { RegisterUserDto } from './dto/register-user.dto';
import * as bcrypt from 'bcrypt';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtService } from '@nestjs/jwt/dist';
import { ConfigService } from '@nestjs/config';
import { UserDto } from 'src/user/dto/user.dto';
import { ResponseResultDto } from 'src/dto/response.dto';
import { plainToInstance } from 'class-transformer';
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(
    registerData: RegisterUserDto,
  ): Promise<ResponseResultDto<UserDto>> {
    const checkExisted = await this.userRepository.findOneBy({
      email: registerData.email,
    });
    if (checkExisted) {
      throw new HttpException(
        'This email already existed, please try others!',
        HttpStatus.BAD_REQUEST,
      );
    }
    const hashedPassword = await this.hashPassword(registerData.password);
    const newUser = await this.userRepository.save({
      ...registerData,
      password: hashedPassword,
    });
    return {
      result: plainToInstance(UserDto, newUser),
      statusCode: HttpStatus.CREATED,
      message: 'Create successfully!',
    };
  }

  private async hashPassword(password: string): Promise<string> {
    const saltRound = 10;
    const salt = await bcrypt.genSalt(saltRound);
    const hashed = await bcrypt.hash(password, salt);
    return hashed;
  }

  async login(data: LoginUserDto) {
    const user = await this.userRepository.findOne({
      where: { email: data.email },
    });
    if (!user) {
      throw new HttpException(
        'Email or password was wrong. Please try again',
        HttpStatus.UNAUTHORIZED,
      );
    }
    const checked = await bcrypt.compareSync(data.password, user.password);
    if (!checked) {
      throw new HttpException(
        'Email or password was wrong. Please try again',
        HttpStatus.UNAUTHORIZED,
      );
    }
    const token = await this.generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });
    return token;
  }

  async generateToken(user: {
    id: number;
    email: string;
    role: number;
  }): Promise<any> {
    const accessToken = await this.jwtService.signAsync(user, {
      secret: this.configService.get<string>('SECRET_KEY'),
      expiresIn: this.configService.get<string>('EXPIRES_IN_ACCESS_TOKEN'),
    });
    const refreshToken = await this.jwtService.signAsync(user, {
      secret: this.configService.get<string>('SECRET_KEY'),
      expiresIn: this.configService.get<string>('EXPIRES_IN_REFRESH_TOKEN'),
    });
    return { accessToken, refreshToken };
  }

  async refreshToken(data: any): Promise<any> {
    try {
      const decodedToken = await this.jwtService.verifyAsync(
        data.refreshToken,
        {
          secret: this.configService.get<string>('SECRET_KEY'),
        },
      );
      if (decodedToken) {
        const user = await this.userRepository.findOneBy({
          email: decodedToken.email,
          refreshToken: decodedToken.refreshToken,
        });
        if (user) {
          const payload = { id: user.id, email: user.email, role: user.role };
          return this.generateToken(payload);
        }
        throw new HttpException(
          'Refresh token is not valid',
          HttpStatus.BAD_REQUEST,
        );
      }
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  async handleVerifyToken(token: string) {
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get('SECRET_KEY'),
      });
      return {
        id: payload['id'],
        email: payload['email'],
        role: payload['role'],
      };
    } catch (err) {
      console.log('error: ', err);
      return new HttpException(err, HttpStatus.UNAUTHORIZED);
    }
  }
}
