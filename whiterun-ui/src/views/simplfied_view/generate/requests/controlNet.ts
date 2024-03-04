import axios from "axios";
import {ImageRequest} from "./apiHandler";
import {checkStatusAndRetry} from "./replicateStatusRetry";

const baseURL =
    process.env.REACT_APP_DEV === 'true' ? `http://localhost:8080/api` : 'https://app.bench-ai.com/api';

export const UpscaleControlNet = async (
    prompt: string,
    resolution: string,
    resemblance: number,
    creativity: number,
    hdr: number,
    scheduler: string,
    steps: number,
    guidance_scale: number,
    guess_mode: boolean,
    seed?: number,
    negative_prompt?: string,
    image?: string[] | undefined,
) => {
    const apiResponse: ImageRequest = {
        success: true
    }


    if (image) {
        try {
            console.log("hello")
            console.log(resolution)
            console.log(Number(resolution))
            const payload: Record<string, any> = {
                prompt: prompt,
                image: image[0],
                resolution: Number(resolution),
                resemblance: resemblance,
                creativity: creativity,
                hdr: hdr,
                scheduler: scheduler,
                steps: steps,
                guidance_scale: guidance_scale,
                guess_mode: guess_mode,
            };

            if (seed) {
                payload.seed = seed;
            }

            if (negative_prompt) {
                payload.negative_prompt = negative_prompt
            }

            const response = await axios.post(
                `${baseURL}/replicate/hrcnettile11/upscale`,
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
            apiResponse.success = false
            apiResponse.error = (error as Error).message
        }
    }

    return apiResponse
}