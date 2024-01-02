import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from '../../dto/users/create-user.dto';
import { User } from '@prisma/client';
import * as argon2 from 'argon2';

@Injectable()
export class UsersService {
  constructor(private prismaService: PrismaService) {}

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    try {
      const hashedPassword = await argon2.hash(createUserDto.password, {
        type: argon2.argon2id,
        memoryCost: 2 ** 16,
        hashLength: 50,
      });

      return this.prismaService.user.create({
        data: {
          ...createUserDto,
          password: hashedPassword,
        },
      });
    } catch (e) {
      if (e.code === 'P2002') {
        // Unique constraint failed on the field
        throw new ConflictException('A user with this email already exists.');
      }
      console.log(e);
      throw new InternalServerErrorException('Failed to create user.');
    }
  }

  async getAllUsers(): Promise<User[]> {
    return this.prismaService.user.findMany();
  }

    async getUserById(id: string): Promise<User> {
        return this.prismaService.user.findUnique({where: { id }});
    }
}
