import { IsEnum } from 'class-validator';
import { Role } from '../../roles/role.enum';

export class UpdateUserRoleDto {
  @IsEnum(Role)
  role!: Role;
}
