import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from '../../dto/users/create-user.dto';
import { UsersService } from '../users/users.service';
import * as argon2 from 'argon2';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private prismaService: PrismaService,
    private usersService: UsersService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.prismaService.user.findUnique({
      where: { email: email },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isPasswordValid = await argon2.verify(user.password, password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password!');
    }

    const { ...result } = user;
    return result;
  }

  async login(email: string, password: string) {
    const user = await this.validateUser(email, password);

    const payload: {email: string, sub: string, role: string, tokenVersion: number} = { email: user.email, sub: user.id, role: user.role, tokenVersion: user.tokenVersion };
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_ACCESS_TOKEN_SECRET,
      expiresIn: '15m', // example expiration
    });
    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_REFRESH_TOKEN_SECRET,
      expiresIn: '7d', // example expiration
    });

    await this.prismaService.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    return {
      access_token: accessToken
    };
  }


  async register(createUserDto: CreateUserDto) {
    const existingUser = await this.prismaService.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email is already in use!');
    }

    return this.usersService.createUser(createUserDto);
  }

  // In auth.service.ts

  async refreshToken(refreshToken: string) {
    let decoded;
    try {
      decoded = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_TOKEN_SECRET,
      });
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Fetch the user and increment their tokenVersion
    const user = await this.prismaService.user.findUnique({
      where: { id: decoded.sub },
    });

    if (!user || user.refreshToken !== refreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Increment the user's tokenVersion
    const updatedUser = await this.prismaService.user.update({
      where: { id: user.id },
      data: {
        tokenVersion: user.tokenVersion + 1 },
    });

    // Generate a new access token with the incremented tokenVersion
    const newAccessToken = this.jwtService.sign(
        { email: updatedUser.email, sub: updatedUser.id, role: updatedUser.role, tokenVersion: updatedUser.tokenVersion },
        {
          secret: process.env.JWT_ACCESS_TOKEN_SECRET,
          expiresIn: '15m',
        }
    );

    return { access_token: newAccessToken };
  }

  async logout(userId: string) {
    // Set the refreshToken field to null for the specified user
    await this.prismaService.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });

    // You can also perform other cleanup tasks here if necessary
  }

}
