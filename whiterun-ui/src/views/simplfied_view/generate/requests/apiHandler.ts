import {DallE3} from "./dalle3";
import {SDXL} from "./sdxl";
import {RealVisXL} from "./realVisXL";
import {SDV2} from "./sdV2";
import {UpscaleESRGAN} from "./upscaleEsrgan";
import {UpscaleControlNet} from "./controlNet";
import {Photomaker} from "./photomaker";
import {i2vgen} from "./i2vgen";

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

            return await DallE3(generator["quality"] as string,
                positivePrompt,
                generator["style"] as string,
                generator["resolution"] as string)
        case "SDXL":
            return await SDXL(
                generator["sampler"] as string,
                generator["guidance"] as number,
                generator["steps"] as number,
                positivePrompt,
                negativePrompt,
                generator["seed"] as number,
            )
        case "SD2.1":
            return await SDV2(
                generator["sampler"] as string,
                generator["guidance"] as number,
                generator["steps"] as number,
                positivePrompt,
                negativePrompt,
                generator["seed"] as number,
            )
        case "realvisxl-v2.0":
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

export const upscale = async (
    positivePrompt: string,
    negativePrompt: string | undefined,
    name: string,
    image: string[] | undefined,
    generator: { [p: string]: string | number | boolean }
) => {
    switch(name){
        case "Stable Diffusion":
            return await UpscaleESRGAN(
                image,
            )
        case "ControlNet Tile Upscaler":
            return await UpscaleControlNet(
                positivePrompt,
                generator["resolution"] as string,
                generator["base_image_resemblance"] as number,
                generator["creativity"] as number,
                generator["hdr"] as number,
                generator["sampler"] as string,
                generator["steps"] as number,
                generator["guidance"] as number,
                generator["guess_mode"] as boolean,
                generator["seed"] as number,
                negativePrompt,
                image,
            )
        default:
            const imageReq: ImageRequest = {
                success: false
            }
            return imageReq
    }
};

export const animate = async (
    positivePrompt: string,
    negativePrompt: string | undefined,
    name: string,
    image: string[] | undefined,
    generator: { [p: string]: string | number | boolean }
) => {
    switch (name) {
        case "imageToVideo":
            return await i2vgen(
                positivePrompt,
                generator["guidance"] as number,
                generator["steps"] as number,
                image,
                generator["max_frames"] as number,
                generator["seed"] as number,
            )
        default:
            const imageReq: ImageRequest = {
                success: false
            }
            return imageReq
    }
};
export const imageToImage = async (
    positivePrompt: string,
    negativePrompt: string | undefined,
    name: string,
    image: string[] | undefined,
    generator: { [p: string]: string | number | boolean }
) => {
    switch(name){
        case "SDXL":
            return await SDXL(
                generator["sampler"] as string,
                generator["guidance"] as number,
                generator["steps"] as number,
                positivePrompt,
                negativePrompt,
                generator["seed"] as number,
                image,
                generator["image_strength"] as number,
            )
        case "SD2.1":
            return await SDV2(
                generator["sampler"] as string,
                generator["guidance"] as number,
                generator["steps"] as number,
                positivePrompt,
                negativePrompt,
                generator["seed"] as number,
                image,
                generator["image_strength"] as number,
            )
        case "RealVisXL":
            return await RealVisXL(
                generator["sampler"] as string,
                generator["steps"] as number,
                generator["guidance"] as number,
                generator["safety_filter"] as boolean,
                positivePrompt,
                negativePrompt,
                generator["seed"] as number,
                image,
                generator["prompt_strength"] as number,
            )
        case "Photomaker":
            return await Photomaker (
                generator["style"] as string,
                generator["steps"] as number,
                generator["style_strength"] as number,
                generator["guidance"] as number,
                generator["safety_filter"] as boolean,
                image,
                positivePrompt,
                negativePrompt,
            )
        default:
            const imageReq: ImageRequest = {
                success: false
            }
            return imageReq
    }
};