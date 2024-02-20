import {getPositiveAndNegativePrompts, operatorHandler} from "./operator.js";
import {fetchHTML} from "../constuctOperator.js";
import {stabilityHandler} from "./stabilityV1.js";
import {i2vgen, requestInterceptor} from "../api.js";

export class I2VGenHandler extends operatorHandler {
    constructor(editor, nodeId) {
        super(editor, nodeId);
        const iDict = {
            "max_frames": 16,
            "num_inference_steps": 50,
            "guidance_scale": 9
        }
        this.setInitialData(iDict)
    }

    static async load(dataDict) {
        let html = await fetchHTML("i2vgen")
        const parse = new DOMParser()
        const doc = parse.parseFromString(html, "text/html")

        doc.getElementsByClassName('i2vgen-frames')[0]
            .setAttribute("value", dataDict["max_frames"])

        doc.getElementsByClassName('i2vgen-steps')[0]
            .setAttribute("value", dataDict["num_inference_steps"])

        doc.getElementsByClassName('i2vgen-guidance')[0]
            .setAttribute("value", dataDict["guidance_scale"])

        doc.getElementsByClassName('i2vgen-seed')[0]
            .setAttribute("value", dataDict["seed"])

        return doc.getElementsByClassName("visualization")[0].outerHTML
    }

    setExecVisualizations() {
        const frames = this.getVisualProperties("i2vgen-frames");
        const steps = this.getVisualProperties("i2vgen-steps");
        const guidance = this.getVisualProperties("i2vgen-guidance");
        const seed = this.getVisualProperties("i2vgen-seed");

        frames.addEventListener('input', () =>
            this.updateValue("i2vgen-frames", "max_frames"));

        steps.addEventListener('input', () =>
            this.updateValue("i2vgen-steps", "num_inference_steps"));

        guidance.addEventListener('input', () =>
            this.updateValue("i2vgen-guidance", "guidance_scale"));

        seed.addEventListener('input', () =>
            this.updateValue("i2vgen-seed", "seed"));

        return super.setExecVisualizations();
    }

    removeExecVisualizations() {
        const frames = this.getVisualProperties("i2vgen-frames");
        const steps = this.getVisualProperties("i2vgen-steps");
        const guidance = this.getVisualProperties("i2vgen-guidance");
        const seed = this.getVisualProperties("i2vgen-seed");

        frames.removeEventListener('input', () =>
            this.updateValue("i2vgen-frames", "max_frames"));

        steps.removeEventListener('input', () =>
            this.updateValue("i2vgen-steps", "num_inference_steps"));

        guidance.removeEventListener('input', () =>
            this.updateValue("i2vgen-guidance", "guidance_scale"));

        seed.removeEventListener('input', () =>
            this.updateValue("i2vgen-seed", "seed"));

        return super.removeExecVisualizations();
    }

    async getOutputObject(inputObject) {

        let prompt = inputObject["input_2"];

        prompt = stabilityHandler.processPrompts(prompt)

        const promptArr = getPositiveAndNegativePrompts(prompt)

        if (promptArr[0] === ""){
            alert("No positive prompt was provided, Image to Video Operator only accepts positive prompts!")
        }

        const requestBody = {
            "image": inputObject["input_1"]["file_id"],
            "prompt": promptArr[0],
            "max_frames": this.getNodeData()["max_frames"],
            "num_inference_steps": this.getNodeData()["num_inference_steps"],
            "guidance_scale": this.getNodeData()["guidance_scale"],
        }

        if (this.getNodeData().hasOwnProperty("seed")){
            requestBody["seed"] = this.getNodeData()["seed"]
        }

        let apiResponse;

        try {
            apiResponse = await requestInterceptor(i2vgen, requestBody);
        } catch(error) {
            console.log(error);
        }

        return {
            "output_1": stabilityHandler.fileFromVideoUrl(apiResponse["url"])
        }
    }
}