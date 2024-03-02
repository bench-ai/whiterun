import axios from "axios";

export interface UploadResponse {
    success: boolean
    response?: string
    error?: string
}

export async function uploadImage(fileInput: File){

    const formData = new FormData();
    const baseURL =
        process.env.REACT_APP_DEV === 'true' ? `http://localhost:8080/api` : 'https://app.bench-ai.com/api';

    const uploadResponse: UploadResponse = {
        success: true
    }

    if (fileInput){
        formData.append('file', fileInput);
    }else{
        uploadResponse.success = false
        uploadResponse.error = "null file"
        return uploadResponse
    }

    try {
        const response = await axios.post(
            `${baseURL}/upload/image`,
                formData
            ,
            {withCredentials: true}
        );
        uploadResponse.response = response.data["key"];


    } catch (error) {
        uploadResponse.success = false
        uploadResponse.error = (error as Error).message
    }

    return uploadResponse
}