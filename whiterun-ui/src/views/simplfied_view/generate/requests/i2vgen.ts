import axios from "axios";
import {ImageRequest} from "./apiHandler";
import {checkStatusAndRetry} from "./replicateStatusRetry";

const baseURL =
    process.env.REACT_APP_DEV === 'true' ? `http://localhost:8080/api` : 'https://app.bench-ai.com/api';

export const i2vgen = async (
    positivePrompt: string,
    guidanceScale: number,
    numInferenceSteps: number,
    image: string[] | undefined,
    maxFrames: number,
    seed?: number,
) => {

    const apiResponse: ImageRequest = {
        success: false
    }

    if(image){
        try {
            console.log(image[0])

            const response = await axios.post(
                `${baseURL}/replicate/ali-vilab/i2vgen-xl`,
                {
                    "prompt": positivePrompt,
                    "image": image[0],
                    "max_frames": maxFrames,
                    "guidance_scale": guidanceScale,
                    "num_inference_steps": numInferenceSteps,
                    "seed": seed
                },
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

            // apiResponse.response = response.data["url"]
            // console.log(apiResponse)

        } catch (error) {
            apiResponse.success = false
            apiResponse.error = (error as Error).message
        }
    }else{
        apiResponse.error = "no video provided"
    }

    return apiResponse
};