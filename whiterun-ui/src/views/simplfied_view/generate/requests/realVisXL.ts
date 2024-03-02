import axios, {AxiosResponse} from "axios";
import {ImageRequest} from "./apiHandler";

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

    const startTime = Date.now();


    try {
        console.log("Filter" + safety_filter)
        const payload: Record<string, any> = {
            mode: "text",
            prompt: positivePrompt,
            scheduler: sampler,
            guidance_scale: guidance,
            num_inference_steps: steps,
            disable_safety_checker: !safety_filter, //Flipped safety_filter to match ui
        };
        console.log("tried")
        if (negativePrompt) {
            console.log("Inputted")
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

        let status;

        do {
            const processResponse = await axios.get(
                `${response.data["url"]}`,
                {withCredentials: true}
            );

            status = processResponse.status;

            if (status === 202) {
                const elapsedTime = Date.now() - startTime;
                if (elapsedTime >= 600000) {
                    apiResponse.success = false;
                    apiResponse.error = "Response Timed Out";
                    break;
                }
                await new Promise(resolve => setTimeout(resolve, 10000));
            } else if (status === 200) {
                return await processResponse.data["url"]
            }
        } while (status === 202);

    } catch (error) {
        apiResponse.success = false;
        apiResponse.error = (error as Error).message;
    }

    return apiResponse
};
