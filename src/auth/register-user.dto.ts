import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class registerUserDto {
  @ApiProperty({ description: 'The name of the user', required: true })
  @IsString()
  @IsNotEmpty()
  @Length(1, 10)
  readonly name: string;
  @ApiProperty({ description: 'The userName of the user', required: true })
  @IsString()
  @IsNotEmpty()
  @Length(1, 10)
  readonly userName: string;
  @IsString()
  @IsNotEmpty()
  @Length(1, 10)
  readonly password: string;
}
export class updateUserDto {
  @ApiProperty({ description: 'The updated name of the user' })
  @IsString()
  @Length(1, 10)
  readonly name: string;
  @ApiProperty({
    description: 'The updated userName of the user',
    required: true,
  })
  @IsString()
  @Length(1, 10)
  readonly userName: string;
  @IsString()
  @Length(1, 10)
  readonly password: string;
}
