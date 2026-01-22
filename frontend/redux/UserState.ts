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
      wardNumber: number;
      name: string;
    } | null;
    zone?: {
      name: string;
    } | null;
    isActive?: boolean;
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