import {operatorHandler, TypeCastingError} from "./operator.js";
import {imageToImage, requestInterceptor} from "../api.js";

export class ImageToImageHandler extends operatorHandler {


    handleInputChange(event) {
        const inputValue = event.target.value;
        event.target.setAttribute("value", inputValue)
        event.target["value"] = inputValue
    }

    handleTextChange(event) {
        const inputValue = event.target.value;

        const targetList = event.target.getElementsByTagName("option")

        const targetObject = {}

        for (let i = 0; i < targetList.length; i++){
            targetObject[targetList[i].value] = {
                "number": i,
                "text": targetList[i].textContent
            }

            targetList[i].removeAttribute("selected")
        }

        targetList[targetObject[inputValue]["number"]].setAttribute("selected", "true")
        targetList[targetObject[inputValue]["number"]]["selected"] = "true"

    }

    setExecVisualizations() {
        this.deleteField(this.getVisualProperties("txt-to-img-style"), "disabled");
        this.deleteField(this.getVisualProperties("txt-to-img-engine"), "disabled");
        this.deleteField(this.getVisualProperties("txt-to-img-clip"), "disabled");
        this.deleteField(this.getVisualProperties("txt-to-img-sampler"), "disabled");
        this.deleteField(this.getVisualProperties("txt-to-img-cfg"), "disabled");
        this.deleteField(this.getVisualProperties("txt-to-img-seed"), "disabled");
        this.deleteField(this.getVisualProperties("txt-to-img-step"), "disabled");
        this.deleteField(this.getVisualProperties("txt-to-img-strength"), "disabled");

        this.getVisualProperties("txt-to-img-style")
            .addEventListener('input',this.handleTextChange);

        this.getVisualProperties("txt-to-img-engine")
            .addEventListener('input',this.handleTextChange);

        this.getVisualProperties("txt-to-img-clip")
            .addEventListener('input',this.handleTextChange);

        this.getVisualProperties("txt-to-img-sampler")
            .addEventListener('input',this.handleTextChange);

        this.getVisualProperties("txt-to-img-cfg")
            .addEventListener('input',this.handleInputChange);

        this.getVisualProperties("txt-to-img-seed")
            .addEventListener('input',this.handleInputChange);

        this.getVisualProperties("txt-to-img-step")
            .addEventListener('input',this.handleInputChange);

        this.getVisualProperties("txt-to-img-strength")
            .addEventListener('input',this.handleInputChange);

        return super.setExecVisualizations();
    }

    removeExecVisualizations() {
        this.setField(this.getVisualProperties("txt-to-img-style"), "disabled", "true")
        this.setField(this.getVisualProperties("txt-to-img-engine"), "disabled", "true")
        this.setField(this.getVisualProperties("txt-to-img-clip"), "disabled", "true")
        this.setField(this.getVisualProperties("txt-to-img-sampler"), "disabled", "true")
        this.setField(this.getVisualProperties("txt-to-img-cfg"), "disabled", "true")
        this.setField(this.getVisualProperties("txt-to-img-seed"), "disabled", "true")
        this.setField(this.getVisualProperties("txt-to-img-step"), "disabled", "true")
        this.setField(this.getVisualProperties("txt-to-img-strength"), "disabled", "true");

        this.getVisualProperties("txt-to-img-style")
            .removeEventListener('input',this.handleInputChange);

        this.getVisualProperties("txt-to-img-engine")
            .removeEventListener('input',this.handleInputChange);

        this.getVisualProperties("txt-to-img-clip")
            .removeEventListener('input',this.handleInputChange);

        this.getVisualProperties("txt-to-img-sampler")
            .removeEventListener('input',this.handleInputChange);

        this.getVisualProperties("txt-to-img-cfg")
            .removeEventListener('input',this.handleInputChange);

        this.getVisualProperties("txt-to-img-seed")
            .removeEventListener('input',this.handleInputChange);

        this.getVisualProperties("txt-to-img-step")
            .removeEventListener('input',this.handleInputChange);

        this.getVisualProperties("txt-to-img-strength")
            .removeEventListener('input',this.handleInputChange);

        return super.setExecVisualizations();
    }

    async getOutputObject(inputObject) {
        // inputObject = await super.getOutputObject(inputObject)

        console.log(inputObject)

        let prompts = inputObject["input_1"]
        const imgObject = inputObject["input_2"]
        if (imgObject["type"] !== "image"){
            throw TypeCastingError("Image file", imgObject["type"])
        }

        if(!Array.isArray(prompts)){
            prompts = [prompts]
        }

        const requestBody = {
            "engine_id": this.getVisualProperties("txt-to-img-engine").value,
            "text_prompts": prompts,
            "cfg_scale": parseInt(this.getVisualProperties("txt-to-img-cfg").value),
            "clip_guidance_preset": this.getVisualProperties("txt-to-img-clip").value,
            "sampler": this.getVisualProperties("txt-to-img-sampler").value,
            "seed": parseInt(this.getVisualProperties("txt-to-img-seed").value),
            "steps": parseInt(this.getVisualProperties("txt-to-img-step").value),
            "style_preset": this.getVisualProperties("txt-to-img-style").value,
            "init_image": imgObject["file_id"],
            "init_image_mode": "IMAGE_STRENGTH",
            "image_strength": parseFloat(this.getVisualProperties("txt-to-img-strength").value)
        }

        const response = await requestInterceptor(imageToImage,requestBody)

        let fileId = response["url"].split("?X-Amz-Algorithm")[0]

        fileId = fileId.split("amazonaws.com/")[1]

        return {"output_1": {
                "file_id": fileId,
                "file": "",
                "url": response["url"],
                "type": "image"
            }
        }}

}