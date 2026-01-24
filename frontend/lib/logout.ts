import { AppDispatch } from '@/redux/store';
import { authService } from './auth';

export const handleLogout = async (dispatch: AppDispatch) => {
  await authService.logout(dispatch);
  // The authService.logout already handles the redirect with window.location.replace
};