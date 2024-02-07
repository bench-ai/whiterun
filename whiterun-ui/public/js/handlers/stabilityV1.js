import {operatorHandler, setSelected, TypeCastingError} from "./operator.js";

export class stabilityHandler extends operatorHandler {
    constructor(editor, nodeId, fileName) {
        super(editor, nodeId);
        const iDict = {
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

    static async loadUsingDoc(doc, dataDict){
        const style = doc.getElementsByClassName("txt-to-img-style")[0]
        const engine = doc.getElementsByClassName("txt-to-img-engine")[0]
        const sampler = doc.getElementsByClassName("txt-to-img-sampler")[0]
        const clip = doc.getElementsByClassName("txt-to-img-clip")[0]

        setSelected(dataDict["style_preset"], style)
        setSelected(dataDict["engine_id"], engine)
        setSelected(dataDict["sampler"], sampler)
        setSelected(dataDict["clip_guidance_preset"], clip)

        const cfg = doc.getElementsByClassName("txt-to-img-cfg")[0]
        const seed = doc.getElementsByClassName("txt-to-img-seed")[0]
        const step = doc.getElementsByClassName("txt-to-img-step")[0]

        cfg.setAttribute("value", dataDict["cfg_scale"])
        seed.setAttribute("value", dataDict["seed"])
        step.setAttribute("value", dataDict["steps"])

        return doc.getElementsByClassName("visualization")[0].outerHTML
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

    static processPrompts(textPrompts){
        if (textPrompts) {
            if (!Array.isArray(textPrompts)) {
                if (typeof textPrompts === "object") {
                    textPrompts = [textPrompts];
                }else{
                    alert("Prompt must be object or list")
                    throw new TypeCastingError("Object | List", typeof textPrompts)
                }
            }
        } else {
            alert("No Prompt was provided please connect a prompt grouper or a image prompt")
            throw new TypeCastingError("Object | List", "undefined")
        }

        return textPrompts
    }

    static fileFromUrl(url){
        let fileId = url.split("?X-Amz-Algorithm")[0]
        fileId = fileId.split("amazonaws.com/")[1]

        return {
            "file_id": fileId,
            "file": "",
            "url": url,
            "type": "image"
        }
    }

    setExecVisualizations() {
        const styleSelect = this.getVisualProperties("txt-to-img-style")
        styleSelect.addEventListener("input", () =>
            this.handleTextChange("style_preset", "txt-to-img-style"))

        const engine = this.getVisualProperties("txt-to-img-engine")
        engine.addEventListener("input", () =>
            this.handleTextChange("engine_id", "txt-to-img-engine"))

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

}