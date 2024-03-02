import axios from "axios";
import {DallE3} from "./dalle3";
import {SDXL} from "./sdxl";
import {RealVisXL} from "./realVisXL";

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
        case "SDXL":
            return await SDXL(
                generator["clip"] as string,
                generator["sampler"] as string,
                generator["guidance"] as string,
                generator["seed"] as string,
                generator["steps"] as string,
                positivePrompt,
                negativePrompt
            )
        case "realvisxl-v2.0":
            console.log("trying")
            console.log(negativePrompt)
            console.log("Filter Part One: " + typeof[generator["safety_filter"]])
            console.log("The final test" + (generator["safety_filter"] as boolean))
            return await RealVisXL(
                generator["sampler"] as string,
                generator["steps"] as number,
                generator["guidance"] as number,
                generator["safety_filter"] as boolean,
                positivePrompt,
                negativePrompt,
                generator["seed"] as number,
            )
        default:
            const imageReq: ImageRequest = {
                success: false
            }
            return imageReq
    }
};