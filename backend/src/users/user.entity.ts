import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Role } from '../roles/role.enum';
import { RefreshToken } from '../auth/entities/refresh-token.entity';
import { MagicLinkToken } from '../auth/entities/magic-link-token.entity';
import { OAuthAccount } from '../auth/entities/oauth-account.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ nullable: true })
  name?: string;

  @Column({ type: 'enum', enum: Role, default: Role.MEMBER })
  role!: Role;

  @Column({ type: 'varchar', nullable: true })
  passwordHash?: string | null;

  @Column({ default: true })
  isActive!: boolean;

  @OneToMany(() => RefreshToken, (token) => token.user)
  refreshTokens!: RefreshToken[];

  @OneToMany(() => MagicLinkToken, (token) => token.user)
  magicLinkTokens!: MagicLinkToken[];

  @OneToMany(() => OAuthAccount, (account) => account.user)
  oauthAccounts!: OAuthAccount[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
