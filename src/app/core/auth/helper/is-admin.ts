import { User } from '../../user/user.model';

export function isAdmin(user: User | null): boolean {
  return user?.roles?.includes('ADMIN') ?? false;
}
