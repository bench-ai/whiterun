import {RealVisXL} from "./realVisXL.js";
import {fetchHTML} from "../constuctOperator.js";
import {stabilityHandler} from "./stabilityV1.js";
import {getPositiveAndNegativePrompts} from "./operator.js";
import {realVisXLTextToImage, requestInterceptor} from "../api.js";
import {RealVisXLImageToImageHandler} from "./realVisXLImageToImage.js";

export class RealVisXLMask extends RealVisXLImageToImageHandler {
    constructor(editor, nodeId) {
        super(editor, nodeId);
    }

    static async load(dataDict){

        let html = await fetchHTML("realVisMasking")
        const parse = new DOMParser()
        let doc = parse.parseFromString(html, "text/html")

        doc = await RealVisXL.loadUsingDoc(doc, dataDict)

        let block = doc.getElementsByClassName("slider-hdr")[0]

        block.getElementsByClassName("upscaler-slider")[0].setAttribute(
            "value", dataDict["prompt_strength"]
        )

        block.getElementsByClassName("slider-weight-display")[0]
            .textContent = dataDict["prompt_strength"]

        return doc.getElementsByClassName("visualization")[0].outerHTML
    }

    async getOutputObject(inputObject) {

        let prompt = inputObject["input_3"];

        prompt = stabilityHandler.processPrompts(prompt)

        const promptArr = getPositiveAndNegativePrompts(prompt)

        if (promptArr[0] === ""){
            alert("No positive prompt was provided")
            throw new Error("No valid prompts")
        }

        const requestBody = {
            "mode": "mask",
            "prompt": promptArr[0],
            "negative_prompt" : promptArr[1],
            "image": inputObject["input_1"]["file_id"],
            "mask": inputObject["input_2"]["file_id"],
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
            apiResponse = await requestInterceptor(realVisXLTextToImage, requestBody, true);
        } catch(error) {
            console.log(error);
        }

        return {
            "output_1": stabilityHandler.fileFromUrl(apiResponse["url"])
        }
    }

}