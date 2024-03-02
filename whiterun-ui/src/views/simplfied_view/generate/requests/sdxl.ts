import axios from "axios";
import {ImageRequest} from "./apiHandler";

const baseURL =
    process.env.REACT_APP_DEV === 'true' ? `http://localhost:8080/api` : 'https://app.bench-ai.com/api';

export const SDXL = async (
    clip: string,
    sampler: string,
    guidance: string,
    seed: string,
    steps: string,
    positivePrompt: string,
    negativePrompt?: string,
) => {
    const apiResponse: ImageRequest = {
        success: true
    }

    try {
        const textPrompts = negativePrompt
            ? [positivePrompt, negativePrompt]
            : [positivePrompt];

        const response = await axios.post(
            `${baseURL}/dall-e/text-to-image`,
            {
                "height": 1024,
                "width": 1024,
                "text_prompts": textPrompts,
                "clip_guidance_preset": clip,
                "sampler": sampler,
                "cfg_scale": guidance,
                "seed": seed,
                "steps": steps,
            },
            {withCredentials: true}
        );

        apiResponse.response = response.data["url"]
    } catch (error) {
        apiResponse.success = false
        apiResponse.error = (error as Error).message
    }

    return apiResponse
}