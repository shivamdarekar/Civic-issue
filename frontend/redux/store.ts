import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import { combineReducers } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import issuesReducer from "./slices/issuesSlice";
import userReducer from "./slices/userSlice";
import adminReducer from "./slices/adminSlice";
import zoneReducer from "./slices/zoneSlice";
import userStateReducer from "./UserState";

// Create storage that works with SSR
let storage;

if (typeof window !== "undefined") {
  // Browser environment - use localStorage
  storage = require("redux-persist/lib/storage").default;
} else {
  // Server environment - use noop storage
  storage = {
    getItem(_key: string) {
      return Promise.resolve(null);
    },
    setItem(_key: string, value: any) {
      return Promise.resolve(value);
    },
    removeItem(_key: string) {
      return Promise.resolve();
    },
  };
}

// Persist config for auth (to maintain login state)
const authPersistConfig = {
  key: 'auth',
  storage,
  whitelist: ['user', 'isAuthenticated'] // Only persist user and auth status
};

// Persist config for issues (to cache categories and current issue)
const issuesPersistConfig = {
  key: 'issues',
  storage,
  whitelist: ['categories', 'currentIssue'] // Only persist categories and current issue
};

const rootReducer = combineReducers({
  auth: persistReducer(authPersistConfig, authReducer),
  issues: persistReducer(issuesPersistConfig, issuesReducer),
  user: userReducer,
  admin: adminReducer,
  zone: zoneReducer,
  userState: userStateReducer,
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          'persist/PERSIST', 
          'persist/REHYDRATE', 
          'persist/PURGE',
          'persist/REGISTER',
          'persist/FLUSH',
          'persist/PAUSE',
        ],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

export const persistor = persistStore(store);
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;