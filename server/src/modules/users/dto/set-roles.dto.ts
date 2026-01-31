import { ArrayNotEmpty, IsArray } from 'class-validator';

export class SetRolesDto {
  @IsArray()
  @ArrayNotEmpty()
  roles: string[];
}
