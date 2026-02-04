import { IsEmail, IsString } from 'class-validator';

export class MagicLinkVerifyDto {
  @IsEmail()
  email!: string;

  @IsString()
  token!: string;
}
