import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { registerUserDto, updateUserDto } from './register-user.dto';
import { ChangePasswordDto, loginUserDto } from './login-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/token/auth-token.gaurd';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get()
  @ApiOperation({ summary: 'Get user information' })
  @ApiResponse({
    status: 200,
    description: 'User information retrieved successfully',
  })
  userInfo(): string {
    return 'user information';
  }

  @Post('register')
  @UseInterceptors(FileInterceptor('profilePic'))
  @ApiOperation({ summary: 'Register a new user' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: registerUserDto })
  @ApiResponse({ status: 201, description: 'Registration successful' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async register(
    @Body() registerdto: registerUserDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const user = await this.authService.registerUser(registerdto, file);
    if (user) {
      return { message: 'Registration successful', Token: user.token };
    } else {
      return { message: 'Registration failed' };
    }
  }

  @Put('updateUser/:id')
  @UseInterceptors(FileInterceptor('profilePic'))
  @ApiOperation({ summary: 'Update user information' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: updateUserDto })
  @ApiResponse({ status: 200, description: 'Update successful' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async update(
    @Param('id') userId: string,
    @Body() updatedto: updateUserDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    try {
      const updatedUser = await this.authService.updateUser(
        userId,
        updatedto,
        file,
      );
      return { message: 'Update successful', user: updatedUser };
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('login')
  @ApiOperation({ summary: 'User login' })
  @ApiBody({ type: loginUserDto })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Login failed' })
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
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Access protected resource' })
  @ApiResponse({ status: 200, description: 'Protected resource accessed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getProtectedResource(@Req() req) {
    return { message: 'This is a protected resource', user: req.user };
  }

  @UseGuards(JwtAuthGuard)
  @Delete('delete/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a user' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async deleteUser(@Param('id') userId: string) {
    await this.authService.deleteUser(userId);
    return { message: 'User deleted successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change user password' })
  @ApiBody({ type: ChangePasswordDto })
  @ApiResponse({ status: 200, description: 'Password changed successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async changePassword(@Req() req, @Body() changeDto: ChangePasswordDto) {
    const response = await this.authService.changePassword(
      req.user.sub,
      changeDto,
    );
    return response;
  }

  @Get('allUsers')
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  async getAllUsers(@Query() queryParams: any) {
    const users = await this.authService.allUsers(queryParams);
    return users;
  }
}
