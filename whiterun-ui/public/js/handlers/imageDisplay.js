import {imageDownload, operatorHandler} from "./operator.js";
import {fetchHTML} from "../constuctOperator.js";

export class ImageDisplayHandler extends operatorHandler {

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
        imageDownload(event)
    }

    static async load(dataDict){
        let html = await fetchHTML("imageDisplay")
        const parse = new DOMParser()
        const doc = parse.parseFromString(html, "text/html")
        return doc.getElementsByClassName("visualization")[0].outerHTML
    }

    async getOutputObject(inputObject) {
        const data = inputObject["input_1"]

        if (data === undefined){
            alert("Please connect a operator that supplies an image or video")
            throw new Error("can only work with image or video data")
        } else if (data["type"] === "image"){
            const imageElement = this.getVisualProperties("image-op-file");
            const videoElement = this.getVisualProperties("image-op-file-video");

            imageElement.style.display = "revert";
            videoElement.style.display = "none";

            if(data["url"] !== "") {
                imageElement.src = data["url"]

            } else if (data["file"] !== null){
                const reader = new FileReader();

                reader.onload = function(e) {
                    imageElement.src = e.target.result;
                };

                reader.readAsDataURL(data["file"]);

            } else{
                throw new Error("unable to utilize data")
            }

            this._image_set = true
            return {}
        } else if (data["type"] === "video"){
            const imageElement = this.getVisualProperties("image-op-file");
            const videoElement = this.getVisualProperties("image-op-file-video");

            imageElement.style.display = "none";
            videoElement.style.display = "revert";

            if(data["url"] !== "") {
                videoElement.src = data["url"]

            } else if (data["file"] !== null){
                const reader = new FileReader();

                reader.onload = function(e) {
                    videoElement.src = e.target.result;
                };

                reader.readAsDataURL(data["file"]);

            } else{
                throw new Error("unable to utilize data")
            }

            this._image_set = true
            return {}
        } else{
            alert("Please connect a operator that supplies an image or video")
            throw new Error("can only work with image or video data")
        }
    }
}