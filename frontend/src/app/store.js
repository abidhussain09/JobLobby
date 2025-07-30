// src/app/store.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
    },
    // Middleware can be added here if needed
    // devTools: process.env.NODE_ENV !== 'production', // Enable Redux DevTools only in development
});
