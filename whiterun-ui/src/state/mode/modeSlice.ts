import {createSlice, PayloadAction} from "@reduxjs/toolkit";

interface Mode {
    name: string
    image?: string
    mask?: string
}

interface ModeState {
    value: Mode
}

const initialState: ModeState = {
    value: {
        name: "tti"
    }
}

const modeSlice = createSlice({
    name: "mode",
    initialState,
    reducers: {
        change: (state, action: PayloadAction<Mode>) => {
            state.value = action.payload
        }
    },
});

export default modeSlice.reducer;
export const {change} = modeSlice.actions