import {Controller, Get, Post, Req, UseGuards} from '@nestjs/common';
import {UsersService} from "../../services/users/users.service";
import {AuthGuard} from "@nestjs/passport";
import {Request} from "express";

interface ExtendedRequest extends Request {
    user: {
        userId: string;
        email: string;
        role: string;
    };
}

@Controller('user')
export class UsersController {

    constructor(private usersService: UsersService) {}

    @Get('get-all')
    @UseGuards(AuthGuard('jwt'))
    getAllUsers() {
        return this.usersService.getAllUsers();
    }

    @Post('me')
    @UseGuards(AuthGuard('jwt'))
    getUserById(@Req() request: ExtendedRequest) {
        return this.usersService.getUserById(request.user.userId);
    }
}
