import {configureStore} from "@reduxjs/toolkit";
import modeReducer from "./mode/modeSlice"
import promptReducer from "./prompt/promptSlice"
import generatorReducer from "./generator/generatorSlice"

export const store = configureStore({
    reducer: {
        mode: modeReducer,
        prompt: promptReducer,
        generator: generatorReducer
    },
});

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch;