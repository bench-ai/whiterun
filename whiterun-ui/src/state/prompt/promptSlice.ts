import {createSlice, PayloadAction} from "@reduxjs/toolkit";

interface Prompt {
    positivePrompt: string
    negativePrompt?: string
    enhance: boolean
    promptStyle?: string
}

interface PromptState {
    value: Prompt
}

const initialState: PromptState = {
    value: {
        positivePrompt: "",
        enhance: false
    }
}

const promptSlice = createSlice({
    name: "prompt",
    initialState,
    reducers: {
        updatePositivePrompt: (state, action: PayloadAction<string>) => {
            state.value.positivePrompt = action.payload
        },
        updateNegativePrompt: (state, action: PayloadAction<string | undefined>) => {
            state.value.negativePrompt = action.payload
        },
        switchEnhance: (state) => {
            state.value.enhance = !state.value.enhance
        },
        changeStyle: (state, action: PayloadAction<string | undefined>) => {
            state.value.promptStyle = action.payload
        }
    },
});

export default promptSlice.reducer;

export const {
    updatePositivePrompt,
    updateNegativePrompt,
    switchEnhance,
    changeStyle} = promptSlice.actions