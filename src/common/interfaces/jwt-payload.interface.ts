import { Role } from '../../roles/role.enum';

export interface JwtPayload {
  sub: string;
  email: string;
  role: Role;
}
