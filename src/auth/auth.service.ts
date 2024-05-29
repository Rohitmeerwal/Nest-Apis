/* eslint-disable @typescript-eslint/no-unused-vars */
import { HttpException, HttpStatus, Injectable, Query } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './auth.schema';
import { Model } from 'mongoose';
import { registerUserDto, updateUserDto } from './register-user.dto';
import * as bcrypt from 'bcrypt';
import { TokenService } from 'src/token/token.service';
import { ChangePasswordDto, loginUserDto } from './login-user.dto';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { ApifeaturesService } from 'src/apifeatures/apifeatures.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly tokenService: TokenService,
    private readonly cloudinaryService: CloudinaryService,
    private readonly apiFeaturesService: ApifeaturesService,
  ) {}
  async findByUsername(userName: string): Promise<User | undefined> {
    return this.userModel.findOne({ userName }).exec();
  }

  async registerUser(
    registerUserDto: registerUserDto,
    file: Express.Multer.File,
  ) {
    const { name, userName, password } = registerUserDto;
    const existingUser = await this.findByUsername(userName);
    if (existingUser) {
      throw new HttpException('Username already exists', HttpStatus.CONFLICT);
    }
    const hashPassword = await bcrypt.hash(password, 10);

    let profilePic = null;
    if (file) {
      try {
        const directory_name = 'public/images';
        const uploadResult = await this.cloudinaryService.uploadImage(
          directory_name,
          file,
        );
        profilePic = uploadResult.url;
      } catch (error) {
        throw new Error('Failed to upload profile picture: ' + error.message);
      }
    }

    const createUser = new this.userModel({
      name: name,
      userName: userName,
      password: hashPassword,
      profilePic: profilePic,
    });

    await createUser.save();

    const payload = { username: createUser.userName, sub: createUser._id };
    const token = this.tokenService.generateToken(payload);

    return {
      user: createUser,
      token,
    };
  }
  async updateUser(
    userId: string,
    updateUserDto: updateUserDto,
    file?: Express.Multer.File,
  ) {
    const { name, userName, password } = updateUserDto;
    const user = await this.userModel.findById(userId);

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    if (userName && userName !== user.userName) {
      const existingUser = await this.findByUsername(userName);
      if (existingUser) {
        throw new HttpException('Username already exists', HttpStatus.CONFLICT);
      }
      user.userName = userName;
    }

    if (name) {
      user.name = name;
    }

    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }

    if (file) {
      try {
        const directory_name = 'public/images';
        const uploadResult = await this.cloudinaryService.uploadImage(
          directory_name,
          file,
        );
        user.profilePic = uploadResult.url;
      } catch (error) {
        throw new Error('Failed to upload profile picture: ' + error.message);
      }
    }

    await user.save();

    return {
      user,
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

  async allUsers(queryParams: any): Promise<User[]> {
    this.apiFeaturesService.setQuery(this.userModel.find());
    this.apiFeaturesService.setQueryParams(queryParams);

    const apiFeatures = this.apiFeaturesService.filter().sort().paginate();
    return await apiFeatures.getQuery();
  }
}
