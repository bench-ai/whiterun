import {operatorHandler, setSelected, TypeCastingError} from "./operator.js";
import {requestInterceptor, textToImage} from "../api.js";
import {fetchHTML} from "../constuctOperator.js";

export class textToImageHandler extends operatorHandler {
    constructor(editor, nodeId) {
        super(editor, nodeId);
        const iDict = {
            "height": 832,
            "width": 1216,
            "engine_id": "SDXL_v1.0",
            "seed":0,
            "steps":30,
            "cfg_scale": 7,
            "style_preset": "photographic",
            "sampler": "DDIM",
            "clip_guidance_preset": "NONE",
        }
        this.setInitialData(iDict)
    }

    static async load(dataDict){

        console.log(dataDict)
        let html = await fetchHTML("textToImage")
        const parse = new DOMParser()
        const doc = parse.parseFromString(html, "text/html")

        const style = doc.getElementsByClassName("txt-to-img-style")[0]
        const engine = doc.getElementsByClassName("txt-to-img-engine")[0]
        const sampler = doc.getElementsByClassName("txt-to-img-sampler")[0]
        const clip = doc.getElementsByClassName("txt-to-img-clip")[0]

        setSelected(dataDict["style_preset"], style)
        setSelected(dataDict["engine_id"], engine)
        setSelected(dataDict["sampler"], sampler)
        setSelected(dataDict["clip_guidance_preset"], clip)

        const height = doc.getElementsByClassName("txt-to-img-height")[0]
        const width = doc.getElementsByClassName("txt-to-img-width")[0]
        const cfg = doc.getElementsByClassName("txt-to-img-cfg")[0]
        const seed = doc.getElementsByClassName("txt-to-img-seed")[0]
        const step = doc.getElementsByClassName("txt-to-img-step")[0]

        height.setAttribute("value", dataDict["height"])
        width.setAttribute("value", dataDict["width"])
        cfg.setAttribute("value", dataDict["cfg_scale"])
        seed.setAttribute("value", dataDict["seed"])
        step.setAttribute("value", dataDict["steps"])

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

    updateValue(className, dictKey) {
        const cfg = this.getVisualProperties(className)
        const opDict = {}
        opDict[dictKey] =  parseFloat(cfg.value)

        this.updateNodeData(opDict)
    }

    handleTextChange(keyName, className) {
        const inputValue = this.getVisualProperties(className).value;
        const opDict = {}
        opDict[keyName] = inputValue
        this.updateNodeData(opDict)
    }

    setExecVisualizations() {
        const styleSelect = this.getVisualProperties("txt-to-img-style")
        styleSelect.addEventListener("input", () =>
            this.handleTextChange("style_preset", "txt-to-img-style"))

        const engine = this.getVisualProperties("txt-to-img-engine")
        engine.addEventListener("input", () =>
            this.handleTextChange("engine_id", "txt-to-img-engine"))

        engine.addEventListener("change", () =>
            this.updateHeightAndWidth());

        const clip = this.getVisualProperties("txt-to-img-clip")
        clip.addEventListener("input", () =>
            this.handleTextChange("clip_guidance_preset", "txt-to-img-clip"))

        const sampler = this.getVisualProperties("txt-to-img-sampler")
        sampler.addEventListener("input", () =>
            this.handleTextChange("sampler", "txt-to-img-sampler"))

        const cfg = this.getVisualProperties("txt-to-img-cfg")
        cfg.addEventListener('input', () =>
            this.updateValue("txt-to-img-cfg", "cfg_scale"));

        const seed = this.getVisualProperties("txt-to-img-seed")
        seed.addEventListener('input', () =>
            this.updateValue("txt-to-img-seed", "seed"));

        const step = this.getVisualProperties("txt-to-img-step")
        step.addEventListener('input', () =>
            this.updateValue("txt-to-img-step", "steps"));

        return super.setExecVisualizations();
    }

    removeExecVisualizations() {
        const styleSelect = this.getVisualProperties("txt-to-img-style")
        styleSelect.removeEventListener("input", () =>
            this.handleTextChange("style_preset", "txt-to-img-style"))

        const engine = this.getVisualProperties("txt-to-img-engine")
        engine.removeEventListener("input", () =>
            this.handleTextChange("engine_id", "txt-to-img-engine"))

        engine.removeEventListener("change", () =>
            this.updateHeightAndWidth());

        const clip = this.getVisualProperties("txt-to-img-clip")
        clip.removeEventListener("input", () =>
            this.handleTextChange("clip_guidance_preset", "txt-to-img-clip"))

        const sampler = this.getVisualProperties("txt-to-img-sampler")
        sampler.removeEventListener("input", () =>
            this.handleTextChange("sampler", "txt-to-img-sampler"))

        const cfg = this.getVisualProperties("txt-to-img-cfg")
        cfg.removeEventListener('input', () =>
            this.updateValue("txt-to-img-cfg","cfg_scale"));

        const seed = this.getVisualProperties("txt-to-img-seed")
        seed.removeEventListener('input', () =>
            this.updateValue("txt-to-img-seed", "seed"));

        const step = this.getVisualProperties("txt-to-img-step")
        step.removeEventListener('input', () =>
            this.updateValue("txt-to-img-step","steps"));

        return super.setExecVisualizations();
    }


    async getOutputObject(inputObject) {

        let textPrompts = inputObject["input_1"]

        if (textPrompts) {
            if (!Array.isArray(textPrompts)) {
                if (typeof textPrompts === "object") {
                    textPrompts = [textPrompts];
                }else{
                    alert("Prompt must be object or lost")
                    throw new TypeCastingError("Object | List", typeof textPrompts)
                }
            }
        } else {
            alert("No Prompt was provided please connect a prompt grouper or a image prompt")
            throw new TypeCastingError("Object | List", "undefined")
        }

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