// Store and Provider
export { store, persistor } from './store';
export { ReduxProvider } from './ReduxProvider';

// UserState slice
export {
  setUser as setUserState,
  clearUser as clearUserState,
} from './UserState';

// Hooks
export { useAppDispatch, useAppSelector } from './hooks';

// Actions
export { resetAppState } from './actions';

// Auth slice
export {
  loginUser,
  logoutUser,
  fetchCurrentUser,
  forgotPassword,
  verifyOtp,
  resetPassword,
  clearError as clearAuthError,
  clearAuth,
  initializeAuth,
} from './slices/authSlice';

// Issues slice
export {
  fetchCategories,
  fetchIssueStats,
  createIssue,
  fetchIssues,
  fetchIssueById,
  updateIssueStatus,
  addComment,
  uploadBeforeImages,
  uploadAfterImages,
  clearError as clearIssuesError,
  setCurrentIssue,
  clearCurrentIssue,
  updateIssueInList,
} from './slices/issuesSlice';

// User slice
export {
  fetchFieldWorkerDashboard,
  fetchWardEngineerDashboard,
  fetchAssignedIssuesDashboard,
  updateProfile,
  changePassword,
  fetchActivityLog,
  clearError as clearUserError,
  clearDashboards,
} from './slices/userSlice';

// Admin slice
export {
  registerUser,
  fetchAllUsers,
  fetchUserById,
  updateUser,
  deactivateUser,
  reactivateUser,
  fetchUsersByFilter,
  fetchDepartments,
  fetchAdminDashboard,
  fetchZonesOverview,
  fetchWardsForZone, // NEW
  fetchZoneDetail,
  fetchWardDetail,
  getWardIssues,
  reassignUserWork,
  fetchUserStatistics,
  clearError as clearAdminError,
  clearCurrentDetails,
  updateUserInList as updateAdminUserInList,
} from './slices/adminSlice';

// Zone slice
export {
  fetchZoneOfficerDetail,
  fetchZoneOfficerWards,
  clearError as clearZoneError,
  clearZoneData,
} from './slices/zoneSlice';

// Types
export type { RootState, AppDispatch } from './store';