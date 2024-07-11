import { createSlice } from "@reduxjs/toolkit";

interface CaseCarouselState {
  serverSeed: string | null;
}

const initialState: CaseCarouselState = {
  serverSeed: null,
};

const caseCarouselSlice = createSlice({
  name: "caseCarousel",
  initialState,
  reducers: {
    setServerSeed(state, action) {
      state.serverSeed = action.payload;
    },
  },
});

export const { setServerSeed } = caseCarouselSlice.actions;
export default caseCarouselSlice.reducer;
