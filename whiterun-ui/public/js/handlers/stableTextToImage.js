import {requestInterceptor, textToImage} from "../api.js";
import {fetchHTML} from "../constuctOperator.js";
import {stabilityHandler} from "./stabilityV1.js";

export class textToImageHandler extends stabilityHandler {
    constructor(editor, nodeId) {
        super(editor, nodeId);
        const iDict = {
            "height": 832,
            "width": 1216
        }

        if (!Object.hasOwn(this.getNodeData(), "height")){
            this.updateNodeData(iDict)
        }
    }

    static async load(dataDict){

        let html = await fetchHTML("textToImage")
        const parse = new DOMParser()
        const doc = parse.parseFromString(html, "text/html")

        await stabilityHandler.loadUsingDoc(doc, dataDict)

        const height = doc.getElementsByClassName("txt-to-img-height")[0]
        const width = doc.getElementsByClassName("txt-to-img-width")[0]

        height.setAttribute("value", dataDict["height"])
        width.setAttribute("value", dataDict["width"])

        return doc.getElementsByClassName("visualization")[0].outerHTML
    }

    updateHeightAndWidth() {

        const engineSelect = this.getVisualProperties("txt-to-img-engine");
        const heightInput = this.getVisualProperties("txt-to-img-height");
        const widthInput = this.getVisualProperties("txt-to-img-width");

        const engineValue = engineSelect.value;

        switch (engineValue) {
            case "SDXL_Beta":
                heightInput.value = 512;
                widthInput.value = 896;
                break;
            case "SDXL_v0.9":
                heightInput.value = 832;
                widthInput.value = 1216;
                break;
            case "SDXL_v1.0":
                heightInput.value = 832;
                widthInput.value = 1216;
                break;
            case "SD_v1.6":
                heightInput.value = 832;
                widthInput.value = 1216;
                break;
            case "SD_v2.1":
                heightInput.value = 832;
                widthInput.value = 1216;
                break;
            default:
                heightInput.value = 512;
                widthInput.value = 512;
        }

        const opDict = {
            "height": parseInt(heightInput.value),
            "width": parseInt(widthInput.value)
        }

        this.updateNodeData(opDict)
    }

    setExecVisualizations() {
        const engine = this.getVisualProperties("txt-to-img-engine")

        engine.addEventListener("change", () =>
            this.updateHeightAndWidth());

        return super.setExecVisualizations();
    }

    removeExecVisualizations() {
        const engine = this.getVisualProperties("txt-to-img-engine")
        engine.removeEventListener("change", () =>
            this.updateHeightAndWidth());

        return super.removeExecVisualizations();
    }


    async getOutputObject(inputObject) {

        let textPrompts = inputObject["input_1"]

        textPrompts = stabilityHandler.processPrompts(textPrompts)

        const requestBody = {
            "height": this.getNodeData()["height"],
            "width" : this.getNodeData()["width"],
            "text_prompts": textPrompts,
            "style_preset": this.getNodeData()["style_preset"],
            "engine_id": this.getNodeData()["engine_id"],
            "clip_guidance_preset": this.getNodeData()["clip_guidance_preset"],
            "sampler": this.getNodeData()["sampler"],
            "cfg_scale": this.getNodeData()["cfg_scale"],
            "seed": this.getNodeData()["seed"],
            "steps": this.getNodeData()["steps"],
        };

        let apiResponse;

        try {
            apiResponse = await requestInterceptor(textToImage, requestBody);
        } catch(error) {
            console.log(error);
        }

        return {
            "output_1": stabilityHandler.fileFromUrl(apiResponse["url"])
        }
    }
}