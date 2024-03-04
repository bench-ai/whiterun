import axios, {AxiosResponse} from "axios";
import {ImageRequest} from "./apiHandler";
import {checkStatusAndRetry} from "./replicateStatusRetry";

const baseURL =
    process.env.REACT_APP_DEV === "true"
        ? `http://localhost:8080/api`
        : "https://app.bench-ai.com/api";

export const RealVisXL = async (
    sampler: string,
    steps: number,
    guidance: number,
    safety_filter: boolean,
    positivePrompt: string,
    negativePrompt?: string,
    seed?: number,
) => {
    const apiResponse: ImageRequest = {
        success: true,
    };


    try {
        const payload: Record<string, any> = {
            mode: "text",
            prompt: positivePrompt,
            scheduler: sampler,
            guidance_scale: guidance,
            num_inference_steps: steps,
            disable_safety_checker: !safety_filter, //Flipped safety_filter to match ui
        };
        if (negativePrompt) {
            payload.negative_prompt = negativePrompt;
        }

        if (seed) {
            payload.seed = seed;
        }

        const response: AxiosResponse = await axios.post(
            `${baseURL}/replicate/realvisxl2/text-to-image`,
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

    return apiResponse
};
