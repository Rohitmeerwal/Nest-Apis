export class loginUserDto {
  readonly userName: string;
  readonly password: string;
}
export class ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}
