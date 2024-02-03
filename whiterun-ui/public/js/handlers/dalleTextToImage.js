import {operatorHandler} from "./operator.js";
import {dalleTextToImage, requestInterceptor} from "../api.js";

export class DallETextToImageHandler extends operatorHandler {
    constructor(editor, nodeId) {
        super(editor, nodeId);
    }

    handleTextChange(event) {
        const inputValue = event.target.value;

        const targetList = event.target.getElementsByTagName("option")

        const targetObject = {}

        for (let i = 0; i < targetList.length; i++){
            targetObject[targetList[i].value] = {
                "number": i,
                "text": targetList[i].textContent
            }

            targetList[i].removeAttribute("selected")
        }

        targetList[targetObject[inputValue]["number"]].setAttribute("selected", "true")
        targetList[targetObject[inputValue]["number"]]["selected"] = "true"

    }

    checkPrompt(event) {
        const inputValue = event.target.value;
        event.target.setAttribute("value", inputValue)
        event.target["value"] = inputValue
        event.target.setAttribute("textContent", inputValue)
        event.target["textContent"] = inputValue
    }



    setExecVisualizations() {
        const styleSelect = this.getVisualProperties("dalle-txt-to-img-style")
        this.deleteField(styleSelect, "disabled")
        styleSelect.addEventListener("input", this.handleTextChange)

        const resolution = this.getVisualProperties("dalle-txt-to-img-resolution")
        this.deleteField(resolution, "disabled")
        resolution.addEventListener("input", this.handleTextChange)

        const quality = this.getVisualProperties("dalle-txt-to-img-quality")
        this.deleteField(resolution, "disabled")
        quality.addEventListener("input", this.handleTextChange)

        const prompt = this.getVisualProperties("dalle-txt-to-img-prompt");
        prompt.addEventListener('input', this.checkPrompt);

        return super.setExecVisualizations();
    }

    removeExecVisualizations() {
        this.setField(this.getVisualProperties("dalle-txt-to-img-style"), "disabled", "true")
        this.setField(this.getVisualProperties("dalle-txt-to-img-resolution"), "disabled", "true")
        this.setField(this.getVisualProperties("dalle-txt-to-img-quality"), "disabled", "true")

        const styleSelect = this.getVisualProperties("dalle-txt-to-img-style")
        styleSelect.removeEventListener("input", this.handleTextChange)

        const resolution = this.getVisualProperties("dalle-txt-to-img-resolution")
        resolution.removeEventListener("input", this.handleTextChange)

        const quality = this.getVisualProperties("dalle-txt-to-img-resolution")
        quality.removeEventListener("input", this.handleTextChange)

        const prompt = this.getVisualProperties("dalle-txt-to-img-prompt");
        prompt.removeEventListener('input', this.checkPrompt);

        return super.setExecVisualizations();
    }


    async getOutputObject(inputObject) {
        const quality = this.getVisualProperties("dalle-txt-to-img-quality").value;
        const style = this.getVisualProperties("dalle-txt-to-img-style").value;
        const resolution = this.getVisualProperties("dalle-txt-to-img-resolution").value;
        const prompt = this.getVisualProperties("dalle-txt-to-img-prompt").value;

        const requestBody = {
            "quality": quality,
            "size" : resolution,
            "style": style,
            "prompt": prompt
        };

        let apiResponse;

        try {
            apiResponse = await requestInterceptor(dalleTextToImage, requestBody);
        } catch(error) {
            console.log(error);
        }


        let fileId = apiResponse["url"].split("?X-Amz-Algorithm")[0]

        fileId = fileId.split("amazonaws.com/")[1]

        return {
            "output_1": {
                "file_id": fileId,
                "file": "",
                "url": apiResponse["url"],
                "type": "image"
            }
        };

    }
}