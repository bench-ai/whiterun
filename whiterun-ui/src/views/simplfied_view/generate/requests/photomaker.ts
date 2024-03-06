import axios, {AxiosResponse} from "axios";
import {ImageRequest} from "./apiHandler";
import {checkStatusAndRetry} from "./replicateStatusRetry";

const baseURL =
    process.env.REACT_APP_DEV === "true"
        ? `http://localhost:8080/api`
        : "https://app.bench-ai.com/api";

export const Photomaker = async (
    style: string,
    steps: number,
    style_strength: number,
    guidance: number,
    safety_filter: boolean,
    image: string[] | undefined,
    positivePrompt: string,
    negativePrompt?: string,
    seed?: number,
) => {
    const apiResponse: ImageRequest = {
        success: true,
    };

    if (image) {
        try {
            const payload: Record<string, any> = {
                style_name: style,
                input_image: image[0],
                prompt: positivePrompt += " img",
                num_steps: steps,
                style_strength_ratio: style_strength,
                guidance_scale: guidance,
                disable_safety_checker: !safety_filter, //Flipped safety_filter to match ui
            };
            if (negativePrompt) {
                payload.negative_prompt = negativePrompt;
            }

            if (seed) {
                payload.seed = seed;
            }

            const response = await axios.post(
                `${baseURL}/replicate/tencentarc/photomaker`,
                payload,
                {withCredentials: true}
            );

            const processedUrl = await checkStatusAndRetry(response, async () => {
                return await axios.get(
                    `${response.data["url"]}`,
                    {withCredentials: true}
                );
            });

            if (processedUrl === undefined) {
                apiResponse.success = false;
                apiResponse.error = "Response Timed Out";
            } else {
                apiResponse.response = processedUrl;
            }

        } catch (error) {
            apiResponse.success = false;
            apiResponse.error = (error as Error).message;
        }
    }

    return apiResponse
};
