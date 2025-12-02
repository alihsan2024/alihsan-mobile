import { configureStore } from "@reduxjs/toolkit";
import zakatReducer from "./reduxSlice/zakatSlice";
import donationProjectsReducer from "./reduxSlice/donationProjectSlice";
import orphanSponsorshipReducer from "./reduxSlice/orphanSponsorshipSlice";
import projectDetailReducer from "./reduxSlice/projectDetailSlice";
import authenticationReducer from "./reduxSlice/authenticationSlice";
import basketItemReducer from "./reduxSlice/basketSlice";
import { basketApi } from "./reduxSlice/api/basketApi";

export const store = configureStore({
  reducer: {
    basketItem: basketItemReducer,
    [basketApi.reducerPath]: basketApi.reducer,
    donationProjects: donationProjectsReducer,
    authentication: authenticationReducer,
    orphanSponsorships: orphanSponsorshipReducer,
    projectDetail: projectDetailReducer,
    zakatCalculator: zakatReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(basketApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
