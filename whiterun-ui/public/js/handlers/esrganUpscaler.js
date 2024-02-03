import {operatorHandler} from "./operator.js";
import {imageUpscaler, requestInterceptor} from "../api.js";

export class ImageUpscalerHandler extends operatorHandler {

    constructor(editor, nodeId) {
        super(editor, nodeId);
        this._image_set = false
    }

    setExecVisualizations() {
        this.deleteField(this.getVisualProperties("download-Button"), "disabled")
        this.getVisualProperties("download-Button").addEventListener('click', this.downloadImage);

        return super.setExecVisualizations();
    }

    removeExecVisualizations() {
        this.setField(this.getVisualProperties("download-Button"), "disabled", "true")
        this.getVisualProperties("download-Button").removeEventListener('click', this.downloadImage);

        if (this._image_set){
            this.getVisualProperties("download-Button").removeEventListener('click', this.downloadImage);
        }

        return super.removeExecVisualizations();
    }

    downloadImage(event) {


        const visualizationElement = event.target.closest('.visualization');
        const imageElement = visualizationElement.querySelector('.image-op-file');

        let fc = (base64String) =>{
            const matches = base64String.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64/);

            if (matches && matches.length > 1) {
                return matches[1];
            } else {
                // Default to a generic type if MIME type cannot be determined
                return 'application/octet-stream';
            }
        }

        // const fileId =  this.fileId
        // Create an invisible anchor element
        const a = document.createElement('a');
        a.style.display = 'none';

        const mime = fc(imageElement.src).split("/")[1]

        // Set the download URL and filename
        a.href = imageElement.src
        a.download = `result.${mime}`;
        a.target = "_blank"
        a.rel = "noopener noreferrer"

        // Append the anchor to the document and trigger a click event
        document.body.appendChild(a);
        a.click();

        // Remove the anchor from the document
        document.body.removeChild(a);
    }

    async getOutputObject(inputObject) {
        const data = inputObject["input_1"];

        // Extract file_id from the input file object
        const fileId = data["file_id"];

        // Create the request body for the API call
        const requestBody = {
            "width": 2048,
            "image": fileId,
            "engine_id": "ESRGAN_V1X2",
        };

        let apiResponse;

        try {
            // Make the API request
            apiResponse = await requestInterceptor(imageUpscaler, requestBody);
        } catch(error) {
            console.log(error);
            throw new Error("API request failed");
        }


        const imageElement = this.getVisualProperties("image-op-file");
        imageElement.src = apiResponse["url"];

        return {}
    }
}