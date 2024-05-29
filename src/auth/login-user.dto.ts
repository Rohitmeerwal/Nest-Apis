import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class loginUserDto {
  @ApiProperty({ description: 'The userName of the user' })
  @IsString()
  @IsNotEmpty()
  readonly userName: string;
  readonly password: string;
}
export class ChangePasswordDto {
  @ApiProperty({ description: 'The current password of the user' })
  currentPassword: string;
  @ApiProperty({ description: 'The new password of the user' })
  newPassword: string;
}
