import {
  Controller,
  Post,
  Body,
  UsePipes,
  ValidationPipe,
  SetMetadata,
} from '@nestjs/common';
import { RegisterUserDto } from './dto/register-user.dto';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/login-user.dto';
import { ApiTags, ApiResponse } from '@nestjs/swagger';
import { UserDto } from 'src/user/dto/user.dto';
import { ResponseResultDto } from 'src/dto/response.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/register')
  @SetMetadata('isPublic', true)
  @ApiResponse({ status: 201, description: 'Register successful!' })
  @ApiResponse({ status: 401, description: 'Email or passowrd is not valid!' })
  register(
    @Body() registerUserData: RegisterUserDto,
  ): Promise<ResponseResultDto<UserDto>> {
    return this.authService.register(registerUserData);
  }

  @Post('/login')
  @SetMetadata('isPublic', true)
  @ApiResponse({ status: 201, description: 'Login successful!' })
  @ApiResponse({ status: 401, description: 'Email or passowrd is incorret!' })
  @UsePipes(ValidationPipe)
  login(@Body() loginData: LoginUserDto): any {
    return this.authService.login(loginData);
  }

  @Post('/refresh-token')
  @SetMetadata('isPublic', true)
  @ApiResponse({ status: 201, description: 'Refresh new token successful!' })
  @ApiResponse({ status: 401, description: 'Token is not valid!' })
  refreshToken(
    @Body()
    refreshToken: string,
  ): Promise<any> {
    return this.authService.refreshToken(refreshToken);
  }
}
