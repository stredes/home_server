import { IsArray, IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreateFileDto {
  @IsOptional()
  @IsArray()
  tags?: string[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  expiresAt?: string;

  @IsOptional()
  @IsArray()
  roles?: string[];
}
