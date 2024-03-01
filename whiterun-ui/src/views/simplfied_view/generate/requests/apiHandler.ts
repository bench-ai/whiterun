import axios from "axios";
import {DallE3} from "./dalle3";

export interface ImageRequest {
    success: boolean
    response?: string
    error?: string
}

export const textToImage = async (
    positivePrompt: string,
    negativePrompt: string | undefined,
    name: string,
    generator: { [key: string]: string | number | boolean}
) => {
    switch(name){
        case "DALLE-3":

            console.log(positivePrompt, generator["quality"],  generator["style"], generator["resolution"])
            return await DallE3(generator["quality"] as string,
                positivePrompt,
                generator["style"] as string,
                generator["resolution"] as string)
        default:
            const imageReq: ImageRequest = {
                success: false
            }
            return imageReq
    }
};