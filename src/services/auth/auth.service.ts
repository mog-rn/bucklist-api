import {Injectable, NotFoundException, UnauthorizedException} from '@nestjs/common';
import {JwtService} from "@nestjs/jwt";
import {PrismaService} from "../prisma/prisma.service";

@Injectable()
export class AuthService {
    constructor(
        private jwtService: JwtService,
        private prismaService: PrismaService
    ) {}

    async validateUser(email: string, password: string): Promise<any> {
        const user = await this.prismaService.user.findUnique({where: {email: email}});

        if (!user) {
            throw new NotFoundException('User not found');
        }

        if (user && user.password === password) {
            const {password, ...result} = user;
            return result;
        }
        return null;
    }

    async login(user: any) {
        console.log('Login user:', user);  // Add this line for debugging
        const payload = {email: user.email, sub: user.userId};
        return {
            access_token: this.jwtService.sign(payload),
        };
    }
}