import { createSlice } from "@reduxjs/toolkit";

interface userState {
  balance: number;
}

const initialState: userState = {
  balance: 0,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setBalance(state, action) {
      state.balance = action.payload;
    },
    addToBalance(state, action) {
      state.balance += action.payload * 100;
    },
  },
});

export const { addToBalance, setBalance } = userSlice.actions;
export default userSlice.reducer;
