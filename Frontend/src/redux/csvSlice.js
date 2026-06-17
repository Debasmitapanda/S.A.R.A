import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  file: null,
};

const csvSlice = createSlice({
  name: "csv",
  initialState,
  reducers: {
    setCsvFile: (state, action) => {
      state.file = action.payload; // store File object
    },
    clearCsvFile: (state) => {
      state.file = null;
    },
  },
});

export const { setCsvFile, clearCsvFile } = csvSlice.actions;
export default csvSlice.reducer;