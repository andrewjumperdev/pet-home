import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type DogUser = {
  name: string;
  age: number;
  breed: string;
  ownerEmail: string;
};

type DogUserState = {
  user: DogUser | null;
};

const initialState: DogUserState = {
  user: null,
};

const dogUserSlice = createSlice({
  name: "dogUser",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<DogUser>) => {
      state.user = action.payload;
    },
    clearUser: (state) => {
      state.user = null;
    },
  },
});

export const { setUser, clearUser } = dogUserSlice.actions;
export default dogUserSlice.reducer;