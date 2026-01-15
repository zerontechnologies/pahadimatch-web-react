import { configureStore, type Middleware } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { apiSlice } from './api/apiSlice';
import authReducer, { logout, setCredentials } from './slices/authSlice';
import uiReducer from './slices/uiSlice';

// Middleware to reset API cache on auth changes
const resetCacheMiddleware: Middleware = (store) => (next) => (action) => {
  const state = store.getState();
  const previousUserId = state.auth.user?.id;
  
  const result = next(action);
  
  // Reset API cache on logout
  if (logout.match(action)) {
    // Reset all cached queries to prevent stale data
    store.dispatch(apiSlice.util.resetApiState());
  }
  
  // Reset API cache when credentials change (new user logging in)
  if (setCredentials.match(action)) {
    const newState = store.getState();
    const newUserId = newState.auth.user?.id;
    
    // Only reset if it's a different user (or first login)
    if (!previousUserId || previousUserId !== newUserId) {
      // Reset all cached queries to prevent stale data from previous user
      store.dispatch(apiSlice.util.resetApiState());
    }
  }
  
  return result;
};

export const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    auth: authReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    })
    .concat(apiSlice.middleware)
    .concat(resetCacheMiddleware),
  devTools: import.meta.env.DEV,
});

// Setup listeners for RTK Query refetchOnFocus/refetchOnReconnect
setupListeners(store.dispatch);

// Types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

