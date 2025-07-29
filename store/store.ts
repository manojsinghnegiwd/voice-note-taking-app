import { configureStore } from "@reduxjs/toolkit";
import noteReducer from "./note";

export const store = configureStore({
    reducer: {
        note: noteReducer
    }
})