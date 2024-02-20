import {setSelected, TypeCastingError} from "./operator.js";
import {imageToImageMask, requestInterceptor} from "../api.js";
import {fetchHTML} from "../constuctOperator.js";
import {stabilityHandler} from "./stabilityV1.js";

export class ImageToImageMaskHandler extends stabilityHandler {

    constructor(editor, nodeId) {
        super(editor, nodeId);

        if (!Object.hasOwn(this.getNodeData(), "mask_source")){
            this.updateNodeData({"mask_source": "MASK_IMAGE_BLACK"})
        }
    }

    static async load(dataDict){

        let html = await fetchHTML("imageToImageMasking")
        const parse = new DOMParser()
        const doc = parse.parseFromString(html, "text/html")

        await stabilityHandler.loadUsingDoc(doc, dataDict)

        const maskSource = doc.getElementsByClassName("txt-to-img-mask-source")[0]
        setSelected(dataDict["mask_source"], maskSource)

        return doc.getElementsByClassName("visualization")[0].outerHTML
    }

    setExecVisualizations() {
        this.getVisualProperties("txt-to-img-mask-source")
            .addEventListener('input', () =>
                this.handleTextChange("mask_source", "txt-to-img-mask-source"));

        return super.setExecVisualizations();
    }

    removeExecVisualizations() {
        this.getVisualProperties("txt-to-img-mask-source")
            .removeEventListener('input', () =>
                this.handleTextChange("mask_source", "txt-to-img-mask-source"));

        return super.removeExecVisualizations();
    }

    async getOutputObject(inputObject) {

        let prompts = inputObject["input_1"]
        prompts = stabilityHandler.processPrompts(prompts)

        const imgObject = inputObject["input_2"]
        const maskObject = inputObject["input_3"]

        if (imgObject["type"] !== "image"){
            throw TypeCastingError("Image file", imgObject["type"])
        }

        if (maskObject["type"] !== "image"){
            throw TypeCastingError("Image file", imgObject["type"])
        }

        const requestBody = {
            "engine_id": this.getNodeData()["engine_id"],
            "text_prompts": prompts,
            "cfg_scale": this.getNodeData()["cfg_scale"],
            "clip_guidance_preset": this.getNodeData()["clip_guidance_preset"],
            "sampler": this.getNodeData()["sampler"],
            "seed": this.getNodeData()["seed"],
            "steps": this.getNodeData()["steps"],
            "style_preset": this.getNodeData()["style_preset"],
            "init_image": imgObject["file_id"],
            "mask_image": maskObject["file_id"],
            "mask_source": this.getNodeData()["mask_source"],
        }

        const response = await requestInterceptor(imageToImageMask, requestBody, true)

        return {
            "output_1": stabilityHandler.fileFromUrl(response["url"])
        }
    }
}
