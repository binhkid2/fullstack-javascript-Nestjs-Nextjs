import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { Role } from '../roles/role.enum';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
  ) {}

  findByEmail(email: string) {
    return this.usersRepo.findOne({ where: { email } });
  }

  findById(id: string) {
    return this.usersRepo.findOne({ where: { id } });
  }

  async createUser(email: string, name?: string, role: Role = Role.MEMBER) {
    const user = this.usersRepo.create({ email, name, role });
    return this.usersRepo.save(user);
  }

  async createUserWithPassword(
    email: string,
    password: string,
    name?: string,
    role: Role = Role.MEMBER,
  ) {
    const existing = await this.findByEmail(email);
    if (existing) {
      throw new BadRequestException('Email already in use');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = this.usersRepo.create({ email, name, role, passwordHash });
    return this.usersRepo.save(user);
  }

  async updateRole(id: string, role: Role) {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.role = role;
    return this.usersRepo.save(user);
  }

  listUsers() {
    return this.usersRepo.find({
      order: { createdAt: 'DESC' },
    });
  }

  async updateUser(
    id: string,
    updates: { name?: string | null; email?: string; role?: Role },
  ) {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (updates.email && updates.email !== user.email) {
      const existing = await this.findByEmail(updates.email);
      if (existing && existing.id !== user.id) {
        throw new BadRequestException('Email already in use');
      }
    }

    if (updates.name !== undefined) {
      user.name = updates.name ?? undefined;
    }

    if (updates.email !== undefined) {
      user.email = updates.email;
    }

    if (updates.role !== undefined) {
      user.role = updates.role;
    }

    return this.usersRepo.save(user);
  }

  async ensureAdminSeed(email: string, password: string, name?: string) {
    const existing = await this.findByEmail(email);
    if (existing) {
      if (existing.role !== Role.ADMIN) {
        existing.role = Role.ADMIN;
        await this.usersRepo.save(existing);
      }
      return existing;
    }

    return this.createUserWithPassword(email, password, name, Role.ADMIN);
  }
}
