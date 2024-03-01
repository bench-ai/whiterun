import {configureStore} from "@reduxjs/toolkit";
import modeReducer from "./mode/modeSlice"
import promptReducer from "./prompt/promptSlice"
import generatorReducer from "./generator/generatorSlice"
import alertReducer from "./alerts/alertsSlice"

export const store = configureStore({
    reducer: {
        mode: modeReducer,
        prompt: promptReducer,
        generator: generatorReducer,
        alert: alertReducer
    },
});

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch;