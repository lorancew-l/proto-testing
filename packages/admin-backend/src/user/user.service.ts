import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { Prisma } from '.prisma/client';
import * as bcrypt from 'bcrypt';

import { DatabaseService } from '../database/database.service';

import { CreateUserDto } from './dto';

export class EmailConstraintError extends Error {
  constructor() {
    super('Account with this email already exists');
  }
}

@Injectable()
export class UserService {
  private salt: number;

  constructor(private databaseService: DatabaseService, configService: ConfigService) {
    this.salt = Number(configService.get('BCRYPT_SALT'));
  }

  getUsers() {
    return this.databaseService.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
      },
    });
  }

  async createUser({ password, ...userData }: CreateUserDto) {
    try {
      const hash = await bcrypt.hash(password, this.salt);
      const user = await this.databaseService.user.create({
        data: {
          ...userData,
          password: hash,
        },
      });

      return user;
    } catch (error) {
      Logger.error(error);

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (
          error.code === 'P2002' &&
          error.meta &&
          'target' in error.meta &&
          Array.isArray(error.meta.target) &&
          error.meta.target.includes('email')
        ) {
          throw new EmailConstraintError();
        }
      }

      throw Error;
    }
  }

  async getUserByEmail(email: string) {
    return await this.databaseService.user.findUniqueOrThrow({
      where: {
        email,
      },
    });
  }

  async getUserById(id: string) {
    const user = await this.databaseService.user.findUnique({
      where: {
        id,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    return user;
  }
}
