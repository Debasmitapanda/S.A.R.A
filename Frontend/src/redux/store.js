// src/redux/store.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import csvReducer from "./csvSlice";
// Load from localStorage
const persistedAuth = {
  isAuthenticated: !!localStorage.getItem('saraToken'),
  token: localStorage.getItem('saraToken'),
  
  user: JSON.parse(localStorage.getItem('saraUser')),
};

const store = configureStore({
  reducer: {
    auth: authReducer,
    csv:csvReducer
  },
  preloadedState:{
    auth:persistedAuth
  },
});

export default store;