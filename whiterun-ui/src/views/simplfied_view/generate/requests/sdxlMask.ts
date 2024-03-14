import axios from "axios";
import {ImageRequest} from "./apiHandler";

const baseURL =
    process.env.REACT_APP_DEV === 'true' ? `http://localhost:8080/api` : 'https://app.bench-ai.com/api';

export const SDXLMask = async (
    sampler: string,
    guidance: number,
    steps: number,
    positivePrompt: string,
    image: string[] | undefined,
    mask: string | undefined,
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
            style_preset: "photographic"
        }

        if (image && mask) {
            payload.init_image = image[0];
            payload.mask_image = mask;
            payload.mask_source = "MASK_IMAGE_WHITE"
        }

        const response = await axios.post(
            `${baseURL}/stability/image-to-image/mask`,
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