import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role, UserStatus } from '@prisma/client';
import { IsEmail, IsEnum, IsIn, IsNotEmpty, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { PHONE_REGEX } from '../../auth/dto/auth.dto';

export const STAFF_ROLES = ['STAFF', 'DRIVER', 'MANAGER'] as const;

export class ListUsersQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: Role })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @ApiPropertyOptional({ enum: UserStatus })
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;
}

export class CreateUserDto {
  @ApiProperty({ example: 'Tran Thi B' })
  @IsString()
  @IsNotEmpty({ message: 'fullName không được để trống' })
  @MaxLength(100)
  fullName: string;

  @ApiPropertyOptional({ example: 'staff2@example.com' })
  @IsOptional()
  @IsEmail({}, { message: 'email không hợp lệ' })
  email?: string;

  @ApiProperty({ example: '0900000010' })
  @Matches(PHONE_REGEX, { message: 'phone không hợp lệ' })
  phone: string;

  @ApiProperty({ example: 'Password123!', minLength: 8 })
  @IsString()
  @MinLength(8, { message: 'password phải có ít nhất 8 ký tự' })
  password: string;

  @ApiProperty({ enum: STAFF_ROLES })
  @IsIn(STAFF_ROLES, { message: 'role phải là STAFF, DRIVER hoặc MANAGER' })
  role: (typeof STAFF_ROLES)[number];
}

export class UpdateUserDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'fullName không được để trống' })
  @MaxLength(100)
  fullName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail({}, { message: 'email không hợp lệ' })
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Matches(PHONE_REGEX, { message: 'phone không hợp lệ' })
  phone?: string;

  @ApiPropertyOptional({ enum: Role })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}

export class UpdateUserStatusDto {
  @ApiProperty({ enum: UserStatus, description: 'LOCKED = khóa, ACTIVE = mở khóa' })
  @IsEnum(UserStatus)
  status: UserStatus;
}
