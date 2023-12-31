import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { AuthService } from './services/auth/auth.service';
import { AuthController } from './controllers/auth/auth.controller';
import {JwtService} from "@nestjs/jwt";
import { PrismaService } from './services/prisma/prisma.service';
import { UsersService } from './services/users/users.service';
import { UsersController } from './controllers/users/users.controller';

@Module({
  imports: [AuthModule],
  controllers: [AppController, AuthController, UsersController],
  providers: [AppService, AuthService, JwtService, PrismaService, UsersService],
})
export class AppModule {}
