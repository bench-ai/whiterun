import {createSlice, PayloadAction} from "@reduxjs/toolkit";

export interface Alert {
    message: string
    description: string
    level: string
}

interface AlertState {
    value: Alert
}

const initialState: AlertState = {
    value: {
        message: "",
        description: "",
        level: "calm"
    }
}

const AlertSlice = createSlice({
    name: "alert",
    initialState,
    reducers: {
        updateAlert: (state, action: PayloadAction<Alert>) => {
            state.value = action.payload
        },
        resetAlert: (state) => {
            state.value = initialState.value
        },
    },
});

export default AlertSlice.reducer;

export const {
    resetAlert,
    updateAlert} = AlertSlice.actions