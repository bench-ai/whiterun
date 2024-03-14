import axios from "axios";
import {ImageRequest} from "./apiHandler";

const baseURL =
    process.env.REACT_APP_DEV === 'true' ? `http://localhost:8080/api` : 'https://app.bench-ai.com/api';

export const SDXLMaskImgToImg = async (
    sampler: string,
    guidance: number,
    steps: number,
    positivePrompt: string,
    image: string[] | undefined,
    imageStrength: number,
    negativePrompt?: string,
    seed?: number,
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
            style_preset: "photographic",
            image_strength: imageStrength,
            init_image_mode: "IMAGE_STRENGTH",
        }

        if (image) {
            payload.init_image = image[0];
        }

        const response = await axios.post(
            `${baseURL}/stability/image-to-image`,
            payload,
            {withCredentials: true}
        );
        apiResponse.response = response.data["url"]

    } catch (error) {
        apiResponse.success = false
        apiResponse.error = (error as Error).message
    }

    return apiResponse
}