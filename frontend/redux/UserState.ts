import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

interface UserState {
  user: {
    id: string;
    fullName: string;
    email: string;
    phoneNumber?: string;
    role: 'FIELD_WORKER' | 'WARD_ENGINEER' | 'ZONE_OFFICER' | 'SUPER_ADMIN';
    department?: string | null;
    wardId?: string | null;
    zoneId?: string | null;
    ward?: {
      id: string;
      wardNumber: number;
      name: string;
      zone?: {
        id: string;
        name: string;
        code: string;
      };
    } | null;
    zone?: {
      id: string;
      name: string;
      code: string;
    } | null;
    gamification?: {
      points: number;
      badges: any;
    } | null;
    isActive?: boolean;
    createdAt?: string;
  } | null;
}

const initialState: UserState = {
  user: null,
}

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<UserState['user']>) => {
      state.user = action.payload;
    },
    clearUser: (state) => {
      state.user = null;
    },
  },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;