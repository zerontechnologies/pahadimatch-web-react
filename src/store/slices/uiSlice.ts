import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

export interface ConfirmDialog {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'default';
  onConfirm?: () => void;
  onCancel?: () => void;
}

export interface UiState {
  toasts: Toast[];
  confirmDialog: ConfirmDialog;
  isSidebarOpen: boolean;
  isMobileMenuOpen: boolean;
  isSearchFilterOpen: boolean;
  globalLoading: boolean;
}

const initialState: UiState = {
  toasts: [],
  confirmDialog: {
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    variant: 'default',
  },
  isSidebarOpen: true,
  isMobileMenuOpen: false,
  isSearchFilterOpen: false,
  globalLoading: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    addToast: (state, action: PayloadAction<Omit<Toast, 'id'>>) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      state.toasts.push({ ...action.payload, id });
    },
    
    removeToast: (state, action: PayloadAction<string>) => {
      state.toasts = state.toasts.filter((toast) => toast.id !== action.payload);
    },
    
    clearToasts: (state) => {
      state.toasts = [];
    },
    
    openConfirmDialog: (state, action: PayloadAction<Omit<ConfirmDialog, 'isOpen'>>) => {
      state.confirmDialog = { ...action.payload, isOpen: true };
    },
    
    closeConfirmDialog: (state) => {
      state.confirmDialog = { ...initialState.confirmDialog };
    },
    
    toggleSidebar: (state) => {
      state.isSidebarOpen = !state.isSidebarOpen;
    },
    
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.isSidebarOpen = action.payload;
    },
    
    toggleMobileMenu: (state) => {
      state.isMobileMenuOpen = !state.isMobileMenuOpen;
    },
    
    setMobileMenuOpen: (state, action: PayloadAction<boolean>) => {
      state.isMobileMenuOpen = action.payload;
    },
    
    toggleSearchFilter: (state) => {
      state.isSearchFilterOpen = !state.isSearchFilterOpen;
    },
    
    setSearchFilterOpen: (state, action: PayloadAction<boolean>) => {
      state.isSearchFilterOpen = action.payload;
    },
    
    setGlobalLoading: (state, action: PayloadAction<boolean>) => {
      state.globalLoading = action.payload;
    },
  },
});

export const {
  addToast,
  removeToast,
  clearToasts,
  openConfirmDialog,
  closeConfirmDialog,
  toggleSidebar,
  setSidebarOpen,
  toggleMobileMenu,
  setMobileMenuOpen,
  toggleSearchFilter,
  setSearchFilterOpen,
  setGlobalLoading,
} = uiSlice.actions;

export default uiSlice.reducer;

// Selectors
export const selectToasts = (state: { ui: UiState }) => state.ui.toasts;
export const selectConfirmDialog = (state: { ui: UiState }) => state.ui.confirmDialog;
export const selectIsSidebarOpen = (state: { ui: UiState }) => state.ui.isSidebarOpen;
export const selectIsMobileMenuOpen = (state: { ui: UiState }) => state.ui.isMobileMenuOpen;
export const selectIsSearchFilterOpen = (state: { ui: UiState }) => state.ui.isSearchFilterOpen;
export const selectGlobalLoading = (state: { ui: UiState }) => state.ui.globalLoading;

