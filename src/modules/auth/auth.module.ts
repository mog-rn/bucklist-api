import { Module } from '@nestjs/common';
import {JwtModule, JwtService} from "@nestjs/jwt";
import {LocalStrategy} from "./strategy/local.strategy";
import {AuthService} from "../../services/auth/auth.service";
import {PrismaService} from "../../services/prisma/prisma.service";
import {UsersService} from "../../services/users/users.service";
import * as process from "process";
import {ConfigModule, ConfigService} from "@nestjs/config";

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true, // Makes ConfigModule globally available
        }),
        JwtModule.registerAsync({
            useFactory: async (configService: ConfigService) => ({
                secret: configService.get('JWT_SECRET'),
                signOptions: { expiresIn: '60s' },
            }),
            inject: [ConfigService],
        }),
    ],
    controllers: [],
    providers: [
        LocalStrategy,
        AuthService,
        PrismaService,
        UsersService
    ],
})
export class AuthModule {}
