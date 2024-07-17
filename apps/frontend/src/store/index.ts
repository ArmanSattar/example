// src/store/index.ts
import { configureStore } from "@reduxjs/toolkit";
import demoReducer from "./slices/demoSlice";
import chatBarReducer from "./slices/chatBarSlice";
import navbarReducer from "./slices/navbarSlice";
import userReducer from "./slices/userSlice";
import caseCarouselReducer from "./slices/caseCarouselSlice";

const store = configureStore({
  reducer: {
    demo: demoReducer,
    chatBar: chatBarReducer,
    navbar: navbarReducer,
    user: userReducer,
    caseCarousel: caseCarouselReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
