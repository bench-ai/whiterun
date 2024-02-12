import {RealVisXL} from "./realVisXL.js";
import {fetchHTML} from "../constuctOperator.js";
import {stabilityHandler} from "./stabilityV1.js";
import {getPositiveAndNegativePrompts} from "./operator.js";
import {realVisXLTextToImage, requestInterceptor} from "../api.js";

export class RealVisXLImageToImageHandler extends RealVisXL {
    constructor(editor, nodeId) {
        super(editor, nodeId);

        if (!Object.hasOwn(this.getNodeData(), "prompt_strength")){
            this.updateNodeData({"prompt_strength": 0.7})
        }
    }

    static async load(dataDict){

        let html = await fetchHTML("realVisImgToImg")
        const parse = new DOMParser()
        let doc = parse.parseFromString(html, "text/html")

        doc = await RealVisXL.loadUsingDoc(doc, dataDict)

        let block = doc.getElementsByClassName("slider-hdr")[0]

        console.log(block)
        block.getElementsByClassName("upscaler-slider")[0].setAttribute(
            "value", dataDict["prompt_strength"]
        )

        block.getElementsByClassName("slider-weight-display")[0]
            .textContent = dataDict["prompt_strength"]

        return doc.getElementsByClassName("visualization")[0].outerHTML
    }

    startSliderListeners(){
        const dataDict = {}

        const block = this.getVisualProperties("slider-hdr")
        const data = block.getElementsByClassName("upscaler-slider")[0]

        dataDict["prompt_strength"] = parseFloat(data.value)

        const display = block.getElementsByClassName("slider-weight-display")[0]

        display.textContent = data.value

        this.updateNodeData(dataDict)
    }

    setExecVisualizations() {

        this.getVisualProperties("slider-hdr")
            .getElementsByClassName("upscaler-slider")[0]
            .addEventListener('input',
                () => this.startSliderListeners());

        return super.setExecVisualizations();
    }

    removeExecVisualizations() {
        this.getVisualProperties("slider-hdr")
            .getElementsByClassName("upscaler-slider")[0]
            .removeEventListener('input',
                () => this.startSliderListeners());

        return super.removeExecVisualizations();
    }

    async getOutputObject(inputObject) {

        let prompt = inputObject["input_2"];

        prompt = stabilityHandler.processPrompts(prompt)

        const promptArr = getPositiveAndNegativePrompts(prompt)

        if (promptArr[0] === ""){
            alert("No positive prompt was provided")
        }

        const requestBody = {
            "mode": "image",
            "prompt": promptArr[0],
            "negative_prompt" : promptArr[1],
            "image": inputObject["input_1"]["file_id"],
            "scheduler": this.getNodeData()["scheduler"],
            "guidance_scale": this.getNodeData()["guidance_scale"],
            "num_inference_steps": this.getNodeData()["num_inference_steps"],
            "disable_safety_checker": this.getNodeData()["disable_safety_checker"],
            "prompt_strength": this.getNodeData()["prompt_strength"]
        };

        if (Object.hasOwn(this.getNodeData(), "seed")) {
            requestBody.seed = this.getNodeData()["seed"];
        }

        console.log(requestBody)

        let apiResponse;

        try {
            apiResponse = await requestInterceptor(realVisXLTextToImage, requestBody);
        } catch(error) {
            console.log(error);
        }

        return {
            "output_1": stabilityHandler.fileFromUrl(apiResponse["url"])
        }
    }

}