// src/redux/authSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isAuthenticated: false,
  user: null,
  token: null, // store JWT token
  
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login(state, action) {
      state.isAuthenticated = true;
     
      state.user = action.payload.user;
      state.token = action.payload.token;
       

      //Adding to local storage
      localStorage.setItem("saraUser",JSON.stringify(action.payload.user))
      
      localStorage.setItem("saraToken",action.payload.token);


    },
    logout(state) {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      

      //removing from local storage
      localStorage.removeItem("saraUser");
      
      localStorage.removeItem("saraToken");
    },
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;