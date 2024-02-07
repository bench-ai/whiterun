import {operatorHandler} from "./operator.js";
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


        const visualizationElement = event.target.closest('.visualization');
        const imageElement = visualizationElement.querySelector('.image-op-file');

        let fc = (base64String) =>{
            const matches = base64String.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64/);

            if (matches && matches.length > 1) {
                return matches[1];
            } else {
                return 'application/octet-stream';
            }
        }

        const a = document.createElement('a');
        a.style.display = 'none';

        const mime = fc(imageElement.src).split("/")[1]

        a.href = imageElement.src
        a.download = `result.${mime}`;
        a.target = "_blank"
        a.rel = "noopener noreferrer"

        document.body.appendChild(a);
        a.click();

        document.body.removeChild(a);
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
            alert("Please connect a operator that supplies a image")
            throw new Error("can only work with image data")
        } else if (data["type"] === "image"){

            if(data["url"] !== "") {
                const imageElement = this.getVisualProperties("image-op-file")
                imageElement.src = data["url"]

            } else if (data["file"] !== null){

                const imageElement = this.getVisualProperties("image-op-file")

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
        }else{
            alert("Please connect a operator that supplies a image")
            throw new Error("can only work with image data")
        }
    }
}