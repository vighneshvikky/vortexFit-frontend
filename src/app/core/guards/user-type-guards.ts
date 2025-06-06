import { AuthenticatedUser } from '../../features/auth/store/actions/auth.actions';
import { User } from '../../features/admin/services/admin.service';
import { Trainer } from '../../features/trainer/models/trainer.interface';
import { Admin } from '../../features/admin/models/admin.interface';

export function isUser(user: AuthenticatedUser): user is User {
  return user.role === 'user';
}

export function isTrainer(user: AuthenticatedUser): user is Trainer {
  return user.role === 'trainer';
}

export function isAdmin(user: AuthenticatedUser): user is Admin {
  return user.role === 'admin';
}
