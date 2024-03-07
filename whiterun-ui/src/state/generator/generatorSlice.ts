import {createSlice, PayloadAction} from "@reduxjs/toolkit";

export interface Option {
    name: string,
    type: string,
    options?: string[]
    start?: number
    stop?: number
    def?: number
    on?: boolean
    value?: number
}

export interface Generator {
    name: string,
    difficulty: string,
    description: string,
    settings: Option[],
}

export interface GeneratorOptionMap{
    [key: string]: Generator[];
}

export interface GeneratorsMap {
    [key: number]: Generator;
}

interface GeneratorState {
    value: GeneratorsMap
}

const initialState: GeneratorState = {
    value: {
        0: {
            name: "none",
            difficulty: "none",
            description: "none",
            settings: [
                {
                    name: "none",
                    type: "none"
                }
            ]
        }
    }
}

const GeneratorSlice = createSlice({
    name: "generator",
    initialState,
    reducers: {
        removeGenerator: (state, action: PayloadAction<number>) => {
            delete state.value[action.payload]
        },
        addGenerator: (state, action: PayloadAction<Generator>) => {
            const keyList = Object.keys(state.value).map(key => {
                    return parseInt(key)
            });

            if (keyList.length === 0){
                state.value[0] = action.payload
            }else if (keyList.length !== 5){
                const maxKey = Math.max(...keyList) + 1
                state.value[maxKey] = action.payload
            }
        },
        updateGenerator: (state, action: PayloadAction<GeneratorsMap>) => {
            const keyList = Object.keys(action.payload)
            const mainKey = parseInt(keyList[0])
            state.value[mainKey] = action.payload[mainKey]
        },
        reset: (state) => {
            state.value = initialState.value
        }
    },
});

export default GeneratorSlice.reducer;

export const {
    removeGenerator,
    addGenerator,
    updateGenerator,
    reset} = GeneratorSlice.actions