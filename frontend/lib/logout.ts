import { AppDispatch } from '@/redux/store';
import { authService } from './auth';

export const handleLogout = async (dispatch: AppDispatch, router: any) => {
  await authService.logout(dispatch);
  router.push('/login');
};