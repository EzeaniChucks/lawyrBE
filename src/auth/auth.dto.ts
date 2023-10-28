import { IsString, IsInt } from 'class-validator';

export class RegisterDTO {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
}

export class LoginDTO {
  email: string;
  password: string;
}

export class UserDetailsResponseDTO {
  @IsString()
  _id: string;
  @IsInt()
  name: string;
  @IsString()
  isAdmin: boolean;
}
