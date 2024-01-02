import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { LocalStrategy } from './strategy/local.strategy';
import { AuthService } from '../../services/auth/auth.service';
import { PrismaService } from '../../services/prisma/prisma.service';
import { UsersService } from '../../services/users/users.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import {JwtStrategy} from "./strategy/jwt.strategy";

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '60s' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [],
  providers: [JwtStrategy, AuthService, LocalStrategy, PrismaService, UsersService],
  exports: [AuthService],
})
export class AuthModule {}
