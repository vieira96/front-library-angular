import { User } from '../user/user.model';

export interface AccessTokenResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  user: User;
}
