import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import {UsersService} from "../../services/users/users.service";
import {AuthService} from "../../services/auth/auth.service";

describe('AuthController', () => {
  let controller: AuthController;

  let mockAuthService = { login: jest.fn(), register: jest.fn(), refreshToken: jest.fn() };
    let mockUsersService = { createUser: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService }, // Mock AuthService
        { provide: UsersService, useValue: mockUsersService }, // Mock UsersService
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
