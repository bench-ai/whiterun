import axios from "axios";
import {ImageRequest} from "./apiHandler";

const baseURL =
    process.env.REACT_APP_DEV === 'true' ? `http://localhost:8080/api` : 'https://app.bench-ai.com/api';

export const UpscaleESRGAN = async (
    image?: string[] | undefined,
) => {
    const apiResponse: ImageRequest = {
        success: true
    }

    try {

        let response;
        if (image) {
            response = await axios.post(
                `${baseURL}/stability/image-to-image/upscale`,
                {
                    "engine_id": "ESRGAN_V1X2",
                    "image": image[0],
                    "width": 2048,
                },
                {withCredentials: true}
            );
        }

        console.log("Pic response: " + response)
        // @ts-ignore
        console.log("Pic response url: " + (response.data["url"]))

        // @ts-ignore
        apiResponse.response = response.data["url"]
        console.log(apiResponse.response)
    } catch (error) {
        apiResponse.success = false
        apiResponse.error = (error as Error).message
    }

    return apiResponse
}