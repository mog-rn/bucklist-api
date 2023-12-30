import { Module } from '@nestjs/common';
import {JwtModule, JwtService} from "@nestjs/jwt";
import {LocalStrategy} from "./strategy/local.strategy";
import {AuthService} from "../../services/auth/auth.service";
import {PrismaService} from "../../services/prisma/prisma.service";

@Module({
    imports: [
        JwtModule.register({
            secret: process.env.JWT_SECRET,
            signOptions: {
                expiresIn: '60s'
            }
        })
    ],
    controllers: [],
    providers: [
        JwtService,
        LocalStrategy,
        AuthService,
        PrismaService
    ],
})
export class AuthModule {}
