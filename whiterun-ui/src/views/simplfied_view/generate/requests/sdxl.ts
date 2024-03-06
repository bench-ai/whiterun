import axios, {AxiosError} from "axios";
import {ImageRequest} from "./apiHandler";

const baseURL =
    process.env.REACT_APP_DEV === 'true' ? `http://localhost:8080/api` : 'https://app.bench-ai.com/api';

export const SDXL = async (
    sampler: string,
    guidance: number,
    steps: number,
    positivePrompt: string,
    negativePrompt?: string,
    seed?: number,
    image?: string[] | undefined,
    imageStrength?: number,
) => {
    const apiResponse: ImageRequest = {
        success: true
    }

    try {
        const textPrompts = negativePrompt
            ? [{"text": positivePrompt, "weight": 2}, {"text": negativePrompt, "weight": -2}]
            : [{"text": positivePrompt, "weight": 2}];


        const payload: Record<string, any> = {
            height: 1024,
            width: 1024,
            engine_id: "SDXL_v1.0",
            text_prompts: textPrompts,
            clip_guidance_preset: "NONE",
            sampler: sampler,
            cfg_scale: guidance,
            seed: seed,
            steps: steps,
            style_preset: "photographic"
        }

        if (image && imageStrength) {
            payload.init_image = image[0];
            payload.image_strength = imageStrength;
            payload.init_image_mode = "IMAGE_STRENGTH";

            const response = await axios.post(
                `${baseURL}/stability/image-to-image`,
                    payload,
                {withCredentials: true}
            );

            apiResponse.response = response.data["url"]
        } else {
            const response = await axios.post(
                `${baseURL}/stability/text-to-image`,
                    payload,
                {withCredentials: true}
            )
            apiResponse.response = response.data["url"]
        }
    } catch (error) {
        let err = error as AxiosError
        apiResponse.success = false

        if (err.response){
            apiResponse.error = err.response.data as string
        }else{
            apiResponse.error = "request failed"
        }
    }

    return apiResponse
}