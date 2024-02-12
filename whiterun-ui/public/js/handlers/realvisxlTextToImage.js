import {getPositiveAndNegativePrompts} from "./operator.js";
import {realVisXLTextToImage, requestInterceptor} from "../api.js";
import {stabilityHandler} from "./stabilityV1.js";
import {fetchHTML} from "../constuctOperator.js";
import {RealVisXL} from "./realVisXL.js";

export class RealVisXLTextToImageHandler extends RealVisXL {
    constructor(editor, nodeId) {
        super(editor, nodeId);
    }

    static async load(dataDict){

        let html = await fetchHTML("realVisTextToImage")
        const parse = new DOMParser()
        let doc = parse.parseFromString(html, "text/html")

        doc = await RealVisXL.loadUsingDoc(doc, dataDict)

        return doc.getElementsByClassName("visualization")[0].outerHTML
    }

    async getOutputObject(inputObject) {

        let prompt = inputObject["input_1"];

        prompt = stabilityHandler.processPrompts(prompt)

        const promptArr = getPositiveAndNegativePrompts(prompt)

        if (promptArr[0] === ""){
            alert("No positive prompt was provided")
            throw new Error("No valid prompts")
        }

        const requestBody = {
            "mode": "text",
            "prompt": promptArr[0],
            "negative_prompt" : promptArr[1],
            "scheduler": this.getNodeData()["scheduler"],
            "guidance_scale": this.getNodeData()["guidance_scale"],
            "num_inference_steps": this.getNodeData()["num_inference_steps"],
            "disable_safety_checker": this.getNodeData()["disable_safety_checker"]
        };

        if (Object.hasOwn(this.getNodeData(), "seed")) {
            requestBody.seed = this.getNodeData()["seed"];
        }

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