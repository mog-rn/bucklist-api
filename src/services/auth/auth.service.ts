import {ConflictException, Injectable, NotFoundException, UnauthorizedException} from '@nestjs/common';
import {JwtService} from "@nestjs/jwt";
import {PrismaService} from "../prisma/prisma.service";
import {CreateUserDto} from "../../dto/users/create-user.dto";
import {UsersService} from "../users/users.service";
import * as argon2 from "argon2";
import {LoginUserDto} from "../../dto/users/login-user.dto";

@Injectable()
export class AuthService {
    constructor(
        private jwtService: JwtService,
        private prismaService: PrismaService,
        private usersService: UsersService
    ) {}

    async validateUser(email: string, password: string): Promise<any> {
        const user = await this.prismaService.user.findUnique({ where: { email: email } });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        const isPasswordValid = await argon2.verify(user.password, password);

        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid password!');
        }

        const { password: hashedPassword, ...result } = user;
        return result;
    }


    async login(email: string, password: string) {
        const user = await this.validateUser(email, password);

        // const { password: hashedPassword, ...result } = user;

        const payload = { email: user.email, sub: user.id };

        return {
            access_token: await this.jwtService.signAsync(payload),
        };
    }


    async register(createUserDto: CreateUserDto) {
        const existingUser = await this.prismaService.user.findUnique({
            where: {email: createUserDto.email}
        })

        if (existingUser) {
            throw new ConflictException('Email is already in use!');
        }

        return this.usersService.createUser(createUserDto);
    }
}
