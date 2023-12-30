import {Controller, Post, Request, UseGuards} from '@nestjs/common';
import {AuthService} from "../../services/auth/auth.service";
import {AuthGuard} from "@nestjs/passport";

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @Post('login')
    @UseGuards(AuthGuard('local'))
    async login(@Request() req: any) {
        return this.authService.login(req.user);
    }
}
