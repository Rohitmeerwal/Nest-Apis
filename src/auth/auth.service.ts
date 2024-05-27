import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './auth.schema';
import { Model } from 'mongoose';
import { registerUserDto } from './register-user.dto';
import * as bcrypt from 'bcrypt';
import { TokenService } from 'src/token/token.service';
import { ChangePasswordDto, loginUserDto } from './login-user.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly tokenService: TokenService,
  ) {}
  async findByUsername(userName: string): Promise<User | undefined> {
    return this.userModel.findOne({ userName }).exec();
  }
  async registerUser(registerUserDto: registerUserDto) {
    const { name, userName, password } = registerUserDto;
    const existingUser = await this.findByUsername(userName);
    if (existingUser) {
      throw new HttpException('Username already exists', HttpStatus.CONFLICT);
    }
    const hashPassword = await bcrypt.hash(password, 10);
    const createUser = new this.userModel({
      name: name,
      userName: userName,
      password: hashPassword,
    });
    await createUser.save();
    const payload = { username: createUser.userName, sub: createUser._id };
    const token = this.tokenService.generateToken(payload);
    return {
      user: createUser,
      token,
    };
  }
  async loginUser(loginDto: loginUserDto) {
    const { userName, password } = loginDto;
    const user = await this.findByUsername(userName);
    if (user && (await bcrypt.compare(password, user.password))) {
      const payload = { username: user.userName, sub: user._id };
      const token = this.tokenService.generateToken(payload);
      return { user, token };
    }
  }
  async deleteUser(userId: string): Promise<void> {
    const result = await this.userModel.deleteOne({ _id: userId }).exec();
    if (result.deletedCount === 0) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
  }

  async changePassword(
    userId: string,
    changeDto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    const { currentPassword, newPassword } = changeDto;
    const user = await this.userModel.findById(userId).exec();
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password,
    );
    if (!isPasswordValid) {
      throw new HttpException(
        'Current password is incorrect',
        HttpStatus.BAD_REQUEST,
      );
    }
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    return { message: 'Password changed successfully' };
  }
}
