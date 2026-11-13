import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export const PHONE_REGEX = /^(0|\+84)\d{9,10}$/;

export class RegisterDto {
  @ApiProperty({ example: 'Nguyen Van A' })
  @IsString()
  @IsNotEmpty({ message: 'fullName không được để trống' })
  @MaxLength(100)
  fullName: string;

  @ApiPropertyOptional({ example: 'customer@example.com' })
  @IsOptional()
  @IsEmail({}, { message: 'email không hợp lệ' })
  email?: string;

  @ApiProperty({ example: '0900000001' })
  @Matches(PHONE_REGEX, { message: 'phone không hợp lệ' })
  phone: string;

  @ApiProperty({ example: 'Password123!', minLength: 8 })
  @IsString()
  @MinLength(8, { message: 'password phải có ít nhất 8 ký tự' })
  password: string;
}

export class LoginDto {
  @ApiProperty({ example: 'customer@example.com', description: 'Email hoặc số điện thoại' })
  @IsString()
  @IsNotEmpty({ message: 'identifier không được để trống' })
  identifier: string;

  @ApiProperty({ example: 'Password123!' })
  @IsString()
  @IsNotEmpty({ message: 'password không được để trống' })
  password: string;
}

export class RefreshTokenDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'refreshToken không được để trống' })
  refreshToken: string;
}
