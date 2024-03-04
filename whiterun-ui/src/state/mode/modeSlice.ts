import {createAsyncThunk, createSlice, PayloadAction} from "@reduxjs/toolkit";
import {downloadImage, uploadImage, UploadResponse} from "../../views/simplfied_view/generate/requests/uploadImage";

interface Mode {
    name: string
    image: string[]
    mask?: string
}

interface ModeState {
    value: Mode
}

const initialState: ModeState = {
    value: {
        name: "tti",
        image: []
    }
}

const modeSlice = createSlice({
    name: "mode",
    initialState,
    reducers: {
        change: (state, action: PayloadAction<Mode>) => {
            state.value = action.payload
        },
        reset: (state) => {
            state.value.image = []
        },
        del: (state, action: PayloadAction<number>) => {
            state.value.image = state.value.image.filter(
                (_, index) => index != action.payload
            );
        }
    },
    extraReducers: (builder) => {
        builder.addCase(appendAsyncImage.fulfilled, (state, action: PayloadAction<UploadResponse>) => {
            if (action.payload.success && action.payload.response) {
                if (state.value.image.length <= 5){
                    state.value.image.push(action.payload.response)
                }
            }
        })
    }
});

export const appendAsyncImage = createAsyncThunk(
    "mode/appendAsyncImage",
    async (res: File) => {
        return await uploadImage(res);
    }
)

export default modeSlice.reducer;
export const {change, reset, del} = modeSlice.actions