import {getPositiveAndNegativePrompts, operatorHandler, setSelected} from "./operator.js";
import {controlNetTileUpscaler, requestInterceptor} from "../api.js";
import {stabilityHandler} from "./stabilityV1.js";
import {fetchHTML} from "../constuctOperator.js";

export class TileUpscaleHandler extends operatorHandler {

    constructor(editor, nodeId) {
        super(editor, nodeId);

        const retObject = {
            "resemblance": 0.5,
            "guidance_scale": 7,
            "hdr": 0.7,
            "creativity": 0.5,
            "scheduler": "DDIM",
            "resolution": "2048",
            "steps": 30,
            "guess_mode": false
        }

        this.setInitialData(retObject)
    }

    checkUncheck(){
        this.updateNodeData({
            "guess_mode": this.getVisualProperties("guess").checked
        })
    }

    static async load(dataDict){

        let html = await fetchHTML("controlNetTile")
        const parse = new DOMParser()
        const doc = parse.parseFromString(html, "text/html")

        const resemblance = doc.getElementsByClassName("slider-resemblance")[0]
        const sliderResemblance = resemblance.getElementsByClassName("upscaler-slider")[0];
        const displayResemblance = resemblance.getElementsByClassName("slider-weight-display")[0]

        const hdr = doc.getElementsByClassName("slider-hdr")[0]
        const sliderHDR = hdr.getElementsByClassName("upscaler-slider")[0];
        const displayHDR = hdr.getElementsByClassName("slider-weight-display")[0]

        const creativity = doc.getElementsByClassName("slider-creativity")[0]
        const sliderCreativity = creativity.getElementsByClassName("upscaler-slider")[0];
        const displayCreativity = creativity.getElementsByClassName("slider-weight-display")[0]

        const cfg = doc.getElementsByClassName("slider-cfg-scale")[0]
        const sliderCFG = cfg.getElementsByClassName("upscaler-slider")[0];
        const displayCFG = cfg.getElementsByClassName("slider-weight-display")[0]

        const scheduler = doc.getElementsByClassName("upscaler-sampler")[0]
        const resolution = doc.getElementsByClassName("upscaler-resolution")[0]
        const seed = doc.getElementsByClassName("upscaler-seed")[0]
        const step = doc.getElementsByClassName("upscaler-step")[0]
        const guess = doc.getElementsByClassName("guess")[0]

        setSelected(dataDict["scheduler"], scheduler)
        setSelected(dataDict["resolution"], resolution)

        sliderResemblance.setAttribute("value", dataDict["resemblance"])
        sliderHDR.setAttribute("value", dataDict["hdr"])
        sliderCreativity.setAttribute("value", dataDict["creativity"])
        sliderCFG.setAttribute("value", dataDict["guidance_scale"])

        displayResemblance.textContent = dataDict["resemblance"]
        displayHDR.textContent = dataDict["hdr"]
        displayCreativity.textContent = dataDict["creativity"]
        displayCFG.textContent = dataDict["guidance_scale"]

        seed.setAttribute("value", dataDict["seed"])
        step.setAttribute("value", dataDict["steps"])

        if (dataDict["guess_mode"]){
            guess.setAttribute("checked", true)
        }

        return doc.getElementsByClassName("visualization")[0].outerHTML
    }

    setExecVisualizations() {

        this.getVisualProperties("slider-resemblance")
            .getElementsByClassName("upscaler-slider")[0]
            .addEventListener('input',
                () => this.startSliderListeners("resemblance", "slider-resemblance"));

        this.getVisualProperties("slider-hdr")
            .getElementsByClassName("upscaler-slider")[0]
            .addEventListener('input',
                () => this.startSliderListeners("hdr", "slider-hdr"));

        this.getVisualProperties("slider-creativity")
            .getElementsByClassName("upscaler-slider")[0]
            .addEventListener('input',
                () => this.startSliderListeners("creativity", "slider-creativity"));

        this.getVisualProperties("slider-cfg-scale")
            .getElementsByClassName("upscaler-slider")[0]
            .addEventListener('input',
                () => this.startSliderListeners("guidance_scale", "slider-cfg-scale"));

        this.getVisualProperties("upscaler-sampler")
            .addEventListener('input',() => this.handleTextChange("scheduler", "upscaler-sampler"));

        this.getVisualProperties("upscaler-resolution")
            .addEventListener('input',() => this.handleTextChange("resolution", "upscaler-resolution"));

        this.getVisualProperties("upscaler-seed")
            .addEventListener('input',() => this.updateValue("upscaler-seed", "seed"));

        this.getVisualProperties("upscaler-step")
            .addEventListener('input', () => this.updateValue("upscaler-step", "steps"));

        this.getVisualProperties("guess")
            .addEventListener('change',() => this.checkUncheck());

        return super.setExecVisualizations();
    }

    removeExecVisualizations() {

        this.getVisualProperties("slider-resemblance")
            .getElementsByClassName("upscaler-slider")[0]
            .removeEventListener('input',
                () => this.startSliderListeners("resemblance", "slider-resemblance"));

        this.getVisualProperties("slider-hdr")
            .getElementsByClassName("upscaler-slider")[0]
            .removeEventListener('input',
                () => this.startSliderListeners("hdr", "slider-hdr"));

        this.getVisualProperties("slider-creativity")
            .getElementsByClassName("upscaler-slider")[0]
            .removeEventListener('input',
                () => this.startSliderListeners("creativity", "slider-creativity"));

        this.getVisualProperties("slider-cfg-scale")
            .getElementsByClassName("upscaler-slider")[0]
            .removeEventListener('input',
                () => this.startSliderListeners("guidance_scale", "slider-cfg-scale"));

        this.getVisualProperties("upscaler-sampler")
            .removeEventListener('input',() => this.handleTextChange("scheduler", "upscaler-sampler"));

        this.getVisualProperties("upscaler-resolution")
            .removeEventListener('input',() => this.handleTextChange("resolution", "upscaler-resolution"));

        this.getVisualProperties("upscaler-seed")
            .removeEventListener('input',() => this.updateValue("upscaler-seed", "seed"));

        this.getVisualProperties("upscaler-step")
            .removeEventListener('input', () => this.updateValue("upscaler-step", "steps"));

        this.getVisualProperties("guess")
            .removeEventListener('change',() => this.checkUncheck());

        return super.removeExecVisualizations();
    }

    async getOutputObject(inputObject) {

        const retObject = {
            "resemblance": this.getNodeData()["resemblance"],
            "guidance_scale": this.getNodeData()["guidance_scale"],
            "hdr": this.getNodeData()["hdr"],
            "creativity": this.getNodeData()["creativity"],
            "scheduler": this.getNodeData()["scheduler"],
            "resolution": parseInt(this.getNodeData()["resolution"]),
            "steps": this.getNodeData()["steps"],
            "guess_mode": this.getNodeData()["guess_mode"],
        }

        if (Object.hasOwn(this.getNodeData(), "seed")){
            retObject["seed"] = this.getNodeData()["seed"]
        }

        if (!inputObject.hasOwnProperty("input_1")){
            alert("No image was provided")
            throw new Error("missing file")
        }else{
            retObject["image"] = inputObject["input_1"]["file_id"]
        }

        if (inputObject.hasOwnProperty("input_2")){
            let prompt = stabilityHandler.processPrompts(inputObject["input_2"])
            const promptArr = getPositiveAndNegativePrompts(prompt)

            if (promptArr[0] !== ""){
                retObject["prompt"] = promptArr[0]
            }

            if (promptArr[1] !== ""){
                retObject["negative_prompt"] = promptArr[1]
            }
        }

        console.log(retObject)

        let apiResponse

        try {
            apiResponse = await requestInterceptor(controlNetTileUpscaler, retObject, true);
        } catch(error) {
            console.log(error);
        }

        return {
            "output_1": stabilityHandler.fileFromUrl(apiResponse["url"])
        }
    }

}