import {createAsyncThunk, createSlice, PayloadAction} from "@reduxjs/toolkit";
import {textToImage} from "../../views/simplfied_view/generate/requests/apiHandler";

export interface Result {
    name: string
    settings: {
        [key: string]: string | number | boolean
    }
    positivePrompt: string
    negativePrompt?: string
    enhanced: boolean
    promptStyle?: string
    enhancedPrompt?: string
    result?: string
    error?: string
    mask?: string
    image?: string
}

interface resultState {
    value: {
        resultArr: Result[],
        pendingCount: number
        enhancing: boolean
    }
}

const initialState: resultState = {
    value:{
        resultArr: [],
        pendingCount: 0,
        enhancing: false
    }
}

const resultSlice = createSlice({
    name: "result",
    initialState,
    reducers: {
        reset: (state) => {
            state.value.resultArr = []
            state.value.pendingCount = 0
            state.value.enhancing = false
        },
        increment: (state) => {
            state.value.pendingCount++
        },
        switchTrue: (state) => {
            state.value.enhancing = true
        },
        switchFalse: (state) => {
            state.value.enhancing = false
        }
    },
    extraReducers : (builder) => {
        builder.addCase(appendTTIResultAsync.fulfilled, (state, action: PayloadAction<Result>) => {
            state.value.resultArr.push(
                action.payload
            )
        })
    }
});

export const appendTTIResultAsync = createAsyncThunk(
    "result/appendTTIResult",
    async (res: Result) => {

        let posP = res.positivePrompt
        if (res.enhanced && res.enhancedPrompt){
            posP = res.enhancedPrompt
        }

        const result = await textToImage(
            posP,
            res.negativePrompt,
            res.name,
            res.settings)

        console.log(result.response)

        const finalResult: Result = {
            ...res,
            settings: {...res.settings},
            result: result.response,
        }

        if (!result.success){
            finalResult.error = result.error
        }

        return finalResult
    }
)

export default resultSlice.reducer;

export const {
    reset,
    increment,
    switchTrue,
    switchFalse,
} = resultSlice.actions
