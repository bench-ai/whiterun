import {imageDownload, operatorHandler} from "./operator.js";
import {imageUpscaler, requestInterceptor} from "../api.js";
import {fetchHTML} from "../constuctOperator.js";
import {stabilityHandler} from "./stabilityV1.js";

export class ImageUpscalerHandler extends operatorHandler {

    constructor(editor, nodeId) {
        super(editor, nodeId);
        this._image_set = false
    }

    setExecVisualizations() {
        this.getVisualProperties("download-Button").addEventListener('click', this.downloadImage);

        return super.setExecVisualizations();
    }

    removeExecVisualizations() {
        this.getVisualProperties("download-Button").removeEventListener('click', this.downloadImage);

        if (this._image_set){
            this.getVisualProperties("download-Button").removeEventListener('click', this.downloadImage);
        }

        return super.removeExecVisualizations();
    }

    downloadImage(event) {
        imageDownload(event)
    }

    static async load(dataDict){
        let html = await fetchHTML("imageUpscaler")
        const parse = new DOMParser()
        const doc = parse.parseFromString(html, "text/html")
        return doc.getElementsByClassName("visualization")[0].outerHTML
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

        return {
            "output_1": stabilityHandler.fileFromUrl(apiResponse["url"])
        }
    }
}