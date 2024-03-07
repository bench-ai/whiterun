import axios from "axios";

const baseURL =
    process.env.REACT_APP_DEV === 'true' ? `http://localhost:8080/api` : 'https://app.bench-ai.com/api';

interface GptApi {
    success: boolean
    response?: string[]
    error?: string
}

export const enhancePrompt = async (
    content: string,
    style: string
) => {

    const apiResponse: GptApi = {
        success: true
    }

    try {
        const response = await axios.post(
            `${baseURL}/openai/prompt/generator`,
            {
                "temperature": 1,
                "content": content,
                "style": style
            },
            {withCredentials: true}
        );

        apiResponse.response = response.data

    } catch (error) {
        apiResponse.success = false
        apiResponse.error = (error as Error).message
    }

    return apiResponse
};