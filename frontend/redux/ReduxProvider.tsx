"use client";

import { Provider } from "react-redux";
import { store } from "./store";

function ReduxInitializer({ children }: { children: React.ReactNode }) {
  // Auth initialization is handled in ProtectWrapper to avoid duplication
  return <>{children}</>;
}

export function ReduxProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <ReduxInitializer>
        {children}
      </ReduxInitializer>
    </Provider>
  );
}