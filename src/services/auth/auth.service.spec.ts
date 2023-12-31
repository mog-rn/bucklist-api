import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { ConflictException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import * as argon2 from 'argon2';


const mockPrismaService = { user: { findUnique: jest.fn(), update: jest.fn() } };
const mockJwtService = { signAsync: jest.fn(), verify: jest.fn(), decode: jest.fn() };
const mockUsersService = { createUser: jest.fn() };
jest.mock('argon2', () => ({
  verify: jest.fn(),
}));

describe('AuthService Integration', () => {
  let service: AuthService;
  const createUserDto = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123',
  };
  const mockUser = {
    id: 1,
    email: 'test@example.com',
    password: '$argon2i$v=19$m=4096,t=3,p=1$hashedsalt$hashedPassword', // Assume this is the hashed version of 'password123'
  };

  beforeEach(async () => {
    jest.clearAllMocks(); // Clear all mock implementations

    service = new AuthService(
        mockJwtService as unknown as JwtService,
        mockPrismaService as unknown as PrismaService,
        mockUsersService as unknown as UsersService,
    );
  });

  describe('register', () => {
    it('should successfully register a user', async () => {
      mockPrismaService.user.findUnique.mockResolvedValueOnce(null);
      mockUsersService.createUser.mockResolvedValueOnce(mockUser);

      const result = await service.register(createUserDto);
      expect(result).toBeDefined();
      expect(result.email).toEqual(createUserDto.email);
    });

    it('should throw ConflictException if email is already in use', async () => {
      mockPrismaService.user.findUnique.mockResolvedValueOnce(mockUser);

      await expect(service.register(createUserDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('should successfully login a user', async () => {
      mockPrismaService.user.findUnique.mockResolvedValueOnce(mockUser);
      (argon2.verify as jest.Mock).mockResolvedValueOnce(true); // Mock password verification to return true
      mockJwtService.signAsync.mockResolvedValueOnce('jwt_token');

      const result = await service.login(createUserDto.email, createUserDto.password);
      expect(result).toBeDefined();
      expect(result.access_token).toBeDefined();
    });

    it('should throw NotFoundException for non-existing user', async () => {
      mockPrismaService.user.findUnique.mockResolvedValueOnce(null);

      await expect(service.login(createUserDto.email, createUserDto.password)).rejects.toThrow(NotFoundException);
    });

    it('should throw UnauthorizedException for invalid password', async () => {
      mockPrismaService.user.findUnique.mockResolvedValueOnce(mockUser);
      // Here, you need to mock a failed password verification (e.g., by mocking argon2.verify if used)

      await expect(service.login(createUserDto.email, 'wrongPassword')).rejects.toThrow(UnauthorizedException);
    });
  });

  // Additional tests for other methods like validateUser, refreshToken
  describe('validateUser', () => {
    it('should validate a user successfully', async () => {
      const mockUser = { id: 1, email: 'test@example.com', password: 'hashedPassword' };
      mockPrismaService.user.findUnique.mockResolvedValueOnce(mockUser);
      (argon2.verify as jest.Mock).mockResolvedValueOnce(true);

      const result = await service.validateUser('test@example.com', 'password123');
      expect(result).toBeDefined();
      expect(result.email).toEqual('test@example.com');
    });

    it('should throw NotFoundException if user is not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValueOnce(null);

      await expect(service.validateUser('test@example.com', 'password123'))
          .rejects.toThrow(NotFoundException);
    });

    it('should throw UnauthorizedException for invalid password', async () => {
      const mockUser = { id: 1, email: 'test@example.com', password: 'hashedPassword' };
      mockPrismaService.user.findUnique.mockResolvedValueOnce(mockUser);
      (argon2.verify as jest.Mock).mockResolvedValue(false); // Mock failed password verification

      await expect(service.validateUser('test@example.com', 'wrongPassword'))
          .rejects.toThrow(UnauthorizedException);
    });
  });

  describe('refreshToken', () => {
    // it('should issue a new access token with a valid refresh token', async () => {
    //   const mockUser = {
    //     id: 1,
    //     email: 'test@example.com',
    //     refreshToken: 'validRefreshToken',
    //   };
    //
    //   mockJwtService.verify.mockReturnValue({ sub: mockUser.id }); // Simulate successful token verification
    //   mockPrismaService.user.findUnique.mockResolvedValueOnce(mockUser);
    //   mockJwtService.signAsync.mockResolvedValueOnce('newAccessToken');
    //
    //   const result = await service.refreshToken('validRefreshToken');
    //   expect(result).toBeDefined();
    //   expect(result.access_token).toEqual('newAccessToken');
    // });

    // Test for invalid refresh token
    it('should throw UnauthorizedException for invalid refresh token', async () => {
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token'); // Simulate token verification failure
      });

      await expect(service.refreshToken('invalidRefreshToken'))
          .rejects.toThrow(UnauthorizedException);
    });

    // Test for mismatched refresh token
    it('should throw UnauthorizedException if refresh token does not match', async () => {
      const mockUser = { id: 1, email: 'test@example.com', refreshToken: 'otherRefreshToken' };
      mockJwtService.verify.mockReturnValue({ sub: 1 }); // Simulate successful token verification
      mockPrismaService.user.findUnique.mockResolvedValueOnce(mockUser);

      await expect(service.refreshToken('mismatchedRefreshToken'))
          .rejects.toThrow(UnauthorizedException);
    });
  });
});
