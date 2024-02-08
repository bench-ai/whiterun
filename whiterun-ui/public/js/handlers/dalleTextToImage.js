import {getPositiveAndNegativePrompts, operatorHandler, setSelected} from "./operator.js";
import {dalleTextToImage, requestInterceptor} from "../api.js";
import {fetchHTML} from "../constuctOperator.js";
import {stabilityHandler} from "./stabilityV1.js";

export class DallETextToImageHandler extends operatorHandler {
    constructor(editor, nodeId) {
        super(editor, nodeId);

        const iDict = {
            "quality": "standard",
            "size" : "1024x1024",
            "style": "vivid",
        }

        this.setInitialData(iDict)
    }

    setExecVisualizations() {
        const styleSelect = this.getVisualProperties("dalle-txt-to-img-style")
        styleSelect.addEventListener("input",
            () => this.handleTextChange("style", "dalle-txt-to-img-style"))

        const resolution = this.getVisualProperties("dalle-txt-to-img-resolution")
        resolution.addEventListener("input",
            () => this.handleTextChange("size", "dalle-txt-to-img-resolution"))

        const quality = this.getVisualProperties("dalle-txt-to-img-quality")
        quality.addEventListener("input",
            () => this.handleTextChange("vivid", "dalle-txt-to-img-quality"))

        return super.setExecVisualizations();
    }

    removeExecVisualizations() {
        const styleSelect = this.getVisualProperties("dalle-txt-to-img-style")
        styleSelect.removeEventListener("input",
            () => this.handleTextChange("style", "dalle-txt-to-img-style"))

        const resolution = this.getVisualProperties("dalle-txt-to-img-resolution")
        resolution.removeEventListener("input",
            () => this.handleTextChange("size", "dalle-txt-to-img-resolution"))

        const quality = this.getVisualProperties("dalle-txt-to-img-quality")
        quality.removeEventListener("input",
            () => this.handleTextChange("vivid", "dalle-txt-to-img-quality"))

        return super.removeExecVisualizations();
    }

    static async load(dataDict){

        let html = await fetchHTML("dalleTextToImage")
        const parse = new DOMParser()
        const doc = parse.parseFromString(html, "text/html")

        const style = doc.getElementsByClassName("dalle-txt-to-img-style")[0]
        const resolution = doc.getElementsByClassName("dalle-txt-to-img-resolution")[0]
        const quality = doc.getElementsByClassName("dalle-txt-to-img-quality")[0]

        setSelected(dataDict["style"], style)
        setSelected(dataDict["size"], resolution)
        setSelected(dataDict["quality"], quality)

        return doc.getElementsByClassName("visualization")[0].outerHTML
    }

    async getOutputObject(inputObject) {
        let prompt = inputObject["input_1"];

        prompt = stabilityHandler.processPrompts(prompt)

        const promptArr = getPositiveAndNegativePrompts(prompt)

        if (promptArr[0] === ""){
            alert("No positive prompt was provided, DALL-E only accepts positive prompts!")
        }

        const requestBody = {
            "quality": this.getNodeData()["quality"],
            "size" : this.getNodeData()["size"],
            "style": this.getNodeData()["style"],
            "prompt": promptArr[0]
        };

        console.log(requestBody)

        let apiResponse;

        try {
            apiResponse = await requestInterceptor(dalleTextToImage, requestBody);
        } catch(error) {
            console.log(error);
        }

        return {
            "output_1": stabilityHandler.fileFromUrl(apiResponse["url"])
        }
    }
}