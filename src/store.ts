import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage"; // usa localStorage
import { combineReducers } from "redux";
import dogUserReducer from "./slices/dogUserSlice"; // Asegúrate de que la ruta sea correcta


const persistConfig = {
  key: "root",
  storage,
};

const rootReducer = combineReducers({
  dogUser: dogUserReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;