import { ApiProperty } from '@nestjs/swagger';
export class UpdateUserDto {
  @ApiProperty()
  firstName: string;
  @ApiProperty()
  lastName: string;
  @ApiProperty()
  avatar: string;
  // @ApiProperty()
  // password: string;
  @ApiProperty()
  email: string;
  // @ApiProperty()
  // refreshToken: string;
  @ApiProperty()
  status: number;
  @ApiProperty()
  role: number;
}
