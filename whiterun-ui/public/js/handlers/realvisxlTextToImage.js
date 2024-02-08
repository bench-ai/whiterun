import {getPositiveAndNegativePrompts, operatorHandler, setSelected} from "./operator.js";
import {realVisXLTextToImage, requestInterceptor} from "../api.js";
import {stabilityHandler} from "./stabilityV1.js";
import {fetchHTML} from "../constuctOperator.js";

export class RealVisXLTextToImageHandler extends operatorHandler {
    constructor(editor, nodeId) {
        super(editor, nodeId);

        const iDict = {
            "scheduler": "DPMSolverMultistep",
            "guidance_scale": 7,
            "num_inference_steps": 40,
            "disable_safety_checker": false
        }

        this.setInitialData(iDict)
    }

    updateFilter() {
        const filterDisabled = this.getVisualProperties("real-vis-txt-to-img-safety").checked;
        this.updateNodeData({
            "disable_safety_checker": filterDisabled
        })
    }

    static async load(dataDict){

        let html = await fetchHTML("realVisTextToImage")
        const parse = new DOMParser()
        const doc = parse.parseFromString(html, "text/html")

        const sampler = doc.getElementsByClassName("real-vis-txt-to-img-sampler")[0];
        const step = doc.getElementsByClassName("real-vis-txt-to-img-steps")[0];
        const guidance = doc.getElementsByClassName("real-vis-txt-to-img-guidance")[0];
        const seed = doc.getElementsByClassName("real-vis-txt-to-img-seed")[0];
        const disabledFilter = doc.getElementsByClassName("real-vis-txt-to-img-safety")[0];

        setSelected(dataDict["scheduler"], sampler)

        guidance.setAttribute("value", dataDict["guidance_scale"])
        seed.setAttribute("value", dataDict["seed"])
        step.setAttribute("value", dataDict["num_inference_steps"])

        if (dataDict["disable_safety_checker"]){
            disabledFilter.setAttribute("checked", true)
        }

        return doc.getElementsByClassName("visualization")[0].outerHTML
    }

    setExecVisualizations() {
        const sampler = this.getVisualProperties("real-vis-txt-to-img-sampler")
        const step = this.getVisualProperties("real-vis-txt-to-img-steps")
        const guidance = this.getVisualProperties("real-vis-txt-to-img-guidance")
        const seed = this.getVisualProperties("real-vis-txt-to-img-seed")
        const disabledFilter = this.getVisualProperties("real-vis-txt-to-img-safety");

        sampler.addEventListener("input", () =>
            this.handleTextChange("scheduler", "real-vis-txt-to-img-sampler"));

        step.addEventListener('input', () =>
            this.updateValue("real-vis-txt-to-img-steps", "num_inference_steps"));

        guidance.addEventListener('input', () =>
            this.updateValue("real-vis-txt-to-img-guidance", "guidance_scale"));

        seed.addEventListener('input', () =>
            this.updateValue("real-vis-txt-to-img-seed", "seed"));

        disabledFilter.addEventListener('change', () => this.updateFilter());

        return super.setExecVisualizations();
    }

    removeExecVisualizations() {
        const sampler = this.getVisualProperties("real-vis-txt-to-img-sampler")
        const step = this.getVisualProperties("real-vis-txt-to-img-steps")
        const guidance = this.getVisualProperties("real-vis-txt-to-img-guidance")
        const seed = this.getVisualProperties("real-vis-txt-to-img-seed")
        const disabledFilter = this.getVisualProperties("real-vis-txt-to-img-safety");

        sampler.removeEventListener("input", () =>
            this.handleTextChange("scheduler", "real-vis-txt-to-img-sampler"));

        step.removeEventListener('input', () =>
            this.updateValue("real-vis-txt-to-img-steps", "num_inference_steps"));

        guidance.removeEventListener('input', () =>
            this.updateValue("real-vis-txt-to-img-guidance", "guidance_scale"));

        seed.removeEventListener('input', () =>
            this.updateValue("real-vis-txt-to-img-seed", "seed"));

        disabledFilter.removeEventListener('change', () => this.updateFilter());

        return super.removeExecVisualizations();
    }

    async getOutputObject(inputObject) {

        let prompt = inputObject["input_1"];

        prompt = stabilityHandler.processPrompts(prompt)

        const promptArr = getPositiveAndNegativePrompts(prompt)

        if (promptArr[0] === ""){
            alert("No positive prompt was provided, DALL-E only accepts positive prompts!")
        }

        const requestBody = {
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