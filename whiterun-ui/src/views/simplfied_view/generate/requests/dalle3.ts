import axios from "axios";
import {ImageRequest} from "./apiHandler";

const baseURL =
    process.env.REACT_APP_DEV === 'true' ? `http://localhost:8080/api` : 'https://app.bench-ai.com/api';

export const DallE3 = async (
    quality: string,
    positivePrompt: string,
    style: string,
    size: string
) => {

    const apiResponse: ImageRequest = {
        success: true
    }

    try {
        const response = await axios.post(
            `${baseURL}/dall-e/text-to-image`,
            {
                "quality": quality,
                "size": size,
                "style": style,
                "prompt": positivePrompt
            },
            {withCredentials: true}
        );

        apiResponse.response = response.data["url"]

    } catch (error) {
        apiResponse.success = false
        apiResponse.error = (error as Error).message
    }

    return apiResponse
};