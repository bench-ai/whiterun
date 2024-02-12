import {getPositiveAndNegativePrompts, operatorHandler, setSelected, TypeCastingError} from "./operator.js";
import {fetchHTML} from "../constuctOperator.js";
import {stabilityHandler} from "./stabilityV1.js";
import {photoMaker, requestInterceptor} from "../api.js";

export class PhotoMakerHandler extends operatorHandler {
    constructor(editor, nodeId) {
        super(editor, nodeId);

        const iDict = {
            "style_name": "Photographic (Default)",
            "num_steps": 20,
            "style_strength_ratio": 20,
            "guidance_scale": 5,
            "disable_safety_checker": false
        }

        this.setInitialData(iDict)
    }

    static async load(dataDict){

        let html = await fetchHTML("photomaker")
        const parse = new DOMParser()
        const doc = parse.parseFromString(html, "text/html")

        const styleStrength = doc.getElementsByClassName("slider-hdr")[0]
        const styleSlider = styleStrength.getElementsByClassName("upscaler-slider")[0];
        const styleDisplay = styleStrength.getElementsByClassName("slider-weight-display")[0]

        const style = doc.getElementsByClassName("photoMaker-style")[0]
        const step = doc.getElementsByClassName("photoMaker-steps")[0]
        const guidance = doc.getElementsByClassName("photoMaker-guidance")[0]
        const seed = doc.getElementsByClassName("photoMaker-seed")[0]
        const safe = doc.getElementsByClassName("photoMaker-safety")[0]

        step.setAttribute("value", dataDict["num_steps"])
        guidance.setAttribute("value", dataDict["guidance_scale"])
        seed.setAttribute("value", dataDict["seed"])

        styleSlider.setAttribute("value", dataDict["style_strength_ratio"])
        styleDisplay.textContent = dataDict["style_strength_ratio"]

        setSelected(dataDict["style_name"], style)

        if (dataDict["disable_safety_checker"]){
            safe.setAttribute("checked", true)
        }

        return doc.getElementsByClassName("visualization")[0].outerHTML
    }

    setExecVisualizations() {

        const style = this.getVisualProperties("photoMaker-style")
        style.addEventListener("input", () =>
            this.handleTextChange("style_name", "photoMaker-style"));

        const step = this.getVisualProperties("photoMaker-steps")
        step.addEventListener('input', () =>
            this.updateValue("photoMaker-steps", "num_steps"));

        const guidance = this.getVisualProperties("photoMaker-guidance")
        guidance.addEventListener('input', () =>
            this.updateValue("photoMaker-guidance", "guidance_scale"));

        const seed = this.getVisualProperties("photoMaker-seed")
        seed.addEventListener('input', () =>
            this.updateValue("photoMaker-seed", "seed"));

        const disabledFilter = this.getVisualProperties("photoMaker-safety");
        disabledFilter.addEventListener('change',
            () => this.updateFilter("photoMaker-safety", "disable_safety_checker"));

        this.getVisualProperties("slider-hdr")
            .addEventListener('input',
                () => this.startSliderListeners(
                    "style_strength_ratio", "slider-hdr"));

        return super.setExecVisualizations();
    }

    removeExecVisualizations() {
        const style = this.getVisualProperties("photoMaker-style")
        style.removeEventListener("input", () =>
            this.handleTextChange("style_name", "photoMaker-style"));

        const step = this.getVisualProperties("photoMaker-steps")
        step.removeEventListener('input', () =>
            this.updateValue("photoMaker-steps", "num_steps"));

        const guidance = this.getVisualProperties("photoMaker-guidance")
        guidance.removeEventListener('input', () =>
            this.updateValue("photoMaker-guidance", "guidance_scale"));

        const seed = this.getVisualProperties("photoMaker-seed")
        seed.removeEventListener('input', () =>
            this.updateValue("photoMaker-seed", "seed"));

        const disabledFilter = this.getVisualProperties("photoMaker-safety");
        disabledFilter.removeEventListener('change',
            () => this.updateFilter("photoMaker-safety", "disable_safety_checker"));

        this.getVisualProperties("slider-hdr")
            .removeEventListener('input',
                () => this.startSliderListeners(
                    "style_strength_ratio", "slider-hdr"));


        return super.removeExecVisualizations();
    }

    async getOutputObject(inputObject) {

        const style = this.getNodeData()["style_name"]
        const steps = this.getNodeData()["num_steps"]
        const guidance = this.getNodeData()["guidance_scale"]
        const disableFilter = this.getNodeData()["disable_safety_checker"]
        const strength = this.getNodeData()["style_strength_ratio"];

        let imgObject = {}

        if (inputObject.hasOwnProperty("input_1")){
            imgObject = inputObject["input_1"]
            if (imgObject["type"] !== "image"){
                throw TypeCastingError("Image file", imgObject["type"])
            }
        }else{
            alert("Photomaker requires the first InputImage to be provided")
            throw new Error("Image not provided")
        }

        let prompt = stabilityHandler.processPrompts(inputObject["input_5"])
        const promptArr = getPositiveAndNegativePrompts(prompt)

        if (!promptArr[0].includes("img")){
            if(!promptArr[0].endsWith(" ")){
                promptArr[0] += " "
            }
            promptArr[0] += "img"
        }

        const requestBody = {
            "prompt": promptArr[0],
            "negative_prompt" : promptArr[1],
            "style_name": style,
            "style_strength_ratio": strength,
            "guidance_scale": guidance,
            "num_steps": steps,
            "disable_safety_checker": disableFilter,
            "input_image": imgObject["file_id"]
        };

        if (this.getNodeData().hasOwnProperty("seed")){
            requestBody["seed"] = this.getNodeData()["seed"]
        }

        const imgDict = {
            "input_2": "input_image2",
            "input_3": "input_image3",
            "input_4": "input_image4"
        }

        for (const [key, value] of Object.entries(imgDict)) {
            if (inputObject.hasOwnProperty(key)){
                if (inputObject[key]["type"] !== "image"){
                    throw TypeCastingError("Image file", imgObject["type"])
                }
                requestBody[value] = inputObject[key]["file_id"]
            }
        }

        let apiResponse

        try {
            apiResponse = await requestInterceptor(photoMaker, requestBody);
        } catch(error) {
            console.log(error);
        }

        return {
            "output_1": stabilityHandler.fileFromUrl(apiResponse["url"])
        }

    }
}