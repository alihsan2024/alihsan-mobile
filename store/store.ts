import { configureStore } from "@reduxjs/toolkit";
import zakatReducer from "./reduxSlice/zakatSlice";
import donationProjectsReducer from "./reduxSlice/donationProjectSlice";

export const store = configureStore({
  reducer: {
    donationProjects: donationProjectsReducer,
    zakatCalculator: zakatReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
