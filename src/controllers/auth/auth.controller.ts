import {Body, Controller, HttpCode, HttpStatus, Post, Request, UseGuards} from '@nestjs/common';
import {AuthService} from "../../services/auth/auth.service";
import {AuthGuard} from "@nestjs/passport";
import {CreateUserDto} from "../../dto/users/create-user.dto";
import {LoginUserDto} from "../../dto/users/login-user.dto";

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @Post('login')
    // @UseGuards(AuthGuard('local'))
    async login(@Body() loginUserDto: LoginUserDto) {
       const user = await this.authService.validateUser(loginUserDto.email, loginUserDto.password);

       return this.authService.login(user);
    }

    @Post('register')
    @HttpCode(HttpStatus.CREATED)
    async register(@Body() createUserDto: CreateUserDto) {
        return this.authService.register(createUserDto);
    }
}