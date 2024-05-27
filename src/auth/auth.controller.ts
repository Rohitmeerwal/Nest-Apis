import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { registerUserDto } from './register-user.dto';
import { ChangePasswordDto, loginUserDto } from './login-user.dto';
import { JwtAuthGuard } from 'src/token/auth-token.gaurd';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Get()
  userInfo(): string {
    return 'user information';
  }
  @Post('register')
  async register(@Body() registerdto: registerUserDto) {
    const user = await this.authService.registerUser(registerdto);
    if (user) {
      return { message: 'Registration successful', Token: user.token };
    } else {
      return { message: 'Login failed' };
    }
  }
  @Post('login')
  async login(@Body() loginDto: loginUserDto) {
    const user = await this.authService.loginUser(loginDto);
    if (user) {
      return { message: 'Login successful', Token: user.token };
    } else {
      return { message: 'Login failed' };
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('protected')
  getProtectedResource(@Req() req) {
    return { message: 'This is a protected resource', user: req.user };
  }

  @UseGuards(JwtAuthGuard)
  @Delete('delete/:id')
  async deleteUser(@Param('id') userId: string) {
    await this.authService.deleteUser(userId);
    return { message: 'User deleted successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  async changePassword(@Req() req, @Body() changeDto: ChangePasswordDto) {
    const response = await this.authService.changePassword(
      req.user.sub,
      changeDto,
    );
    return response;
  }
}
