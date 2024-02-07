import {TypeCastingError} from "./operator.js";
import {imageToImage, requestInterceptor} from "../api.js";
import {fetchHTML} from "../constuctOperator.js";
import {stabilityHandler} from "./stabilityV1.js";


export class ImageToImageHandler extends stabilityHandler {

    constructor(editor, nodeId) {
        super(editor, nodeId);

        if (!Object.hasOwn(this.getNodeData(), "image_strength")){
            this.updateNodeData({"image_strength": 0.35})
        }
    }

    static async load(dataDict){

        let html = await fetchHTML("imageToImage")
        const parse = new DOMParser()
        const doc = parse.parseFromString(html, "text/html")

        await stabilityHandler.loadUsingDoc(doc, dataDict)
        const strength = doc.getElementsByClassName("txt-to-img-strength")[0]
        strength.setAttribute("value", dataDict["image_strength"])

        return doc.getElementsByClassName("visualization")[0].outerHTML
    }

    setExecVisualizations() {
        this.getVisualProperties("txt-to-img-strength")
            .addEventListener('input', () =>
                this.updateValue("txt-to-img-strength", "image_strength"));

        return super.setExecVisualizations();
    }

    removeExecVisualizations() {
        this.getVisualProperties("txt-to-img-strength")
            .removeEventListener('input', () =>
                this.updateValue("txt-to-img-strength", "image_strength"));

        return super.setExecVisualizations();
    }

    async getOutputObject(inputObject) {

        let prompts = inputObject["input_1"]
        const imgObject = inputObject["input_2"]

        if (imgObject["type"] !== "image"){
            alert("image file not provided")
            throw TypeCastingError("Image file", imgObject["type"])
        }

        prompts = stabilityHandler.processPrompts(prompts)

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
            "init_image_mode": "IMAGE_STRENGTH",
            "image_strength": this.getNodeData()["image_strength"]
        }

        console.log(requestBody)

        const response = await requestInterceptor(imageToImage, requestBody)

        return {
            "output_1": stabilityHandler.fileFromUrl(response["url"])
        }
    }

}