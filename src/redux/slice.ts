import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    numbersOfTasks: 0,
};

const todoSlice = createSlice({
    name: "store",
    initialState,
    reducers: {
        numbersOfTasks: (state, action) => {
            state.numbersOfTasks = action.payload;
        },
    },
});

export const {
    numbersOfTasks
} = todoSlice.actions;
export default todoSlice.reducer;
