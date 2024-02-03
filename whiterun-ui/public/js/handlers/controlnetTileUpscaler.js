import {operatorHandler} from "./operator.js";
import {controlNetTileUpscaler, requestInterceptor} from "../api.js";

export class TileUpscaleHandler extends operatorHandler {

    startSliderListeners(element){
        element.target.setAttribute("value", element.target.value)
        const parentElement = element.target.parentElement
        const display = parentElement.getElementsByClassName("slider-weight-display")[0]
        display.setAttribute("textContent", element.target.value)
        display["textContent"] = element.target.value
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

    async getOutputObject(inputObject) {

        console.log(this.getVisualProperties("upscaler-seed").value)

        const retObject = {
            "resemblance": parseFloat(this.getVisualProperties("slider-resemblance")
                .getElementsByClassName("upscaler-slider")[0].value),

            "guidance_scale": parseFloat(this.getVisualProperties("slider-cfg-scale")
                .getElementsByClassName("upscaler-slider")[0].value),

            "hdr": parseFloat(this.getVisualProperties("slider-hdr")
                .getElementsByClassName("upscaler-slider")[0].value),

            "creativity": parseFloat(this.getVisualProperties("slider-creativity")
                .getElementsByClassName("upscaler-slider")[0].value),

            "scheduler": this.getVisualProperties("upscaler-sampler").value,
            "resolution": parseInt(this.getVisualProperties("upscaler-resolution").value),
            "steps": parseInt(this.getVisualProperties("upscaler-step").value),
            "guess_mode": this.getVisualProperties("guess").checked
        }

        if (this.getVisualProperties("upscaler-seed").value !== ""){
            retObject["seed"] = parseInt(this.getVisualProperties("upscaler-seed").value)
        }

        if (!inputObject.hasOwnProperty("input_1")){
            throw new Error("missing file")
        }else{
            retObject["image"] = inputObject["input_1"]["file_id"]
        }

        if (inputObject.hasOwnProperty("input_2")){
            if (typeof inputObject["input_2"] == "object"){
                retObject["prompt"] = inputObject["input_2"]["text"]
            }else{
                retObject["prompt"] = inputObject["input_2"]
            }
        }

        if (inputObject.hasOwnProperty("input_3")){
            if (typeof inputObject["input_3"] == "object"){
                retObject["negative_prompt"] = inputObject["input_3"]["text"]
            }else{
                retObject["negative_prompt"] = inputObject["input_3"]
            }
        }

        console.log(retObject)

        let apiResponse

        try {
            apiResponse = await requestInterceptor(controlNetTileUpscaler, retObject);
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

    handleInputChange(event) {
        const inputValue = event.target.value;
        event.target.setAttribute("value", inputValue)
        event.target["value"] = inputValue
    }

    checkUncheck(event){
        if (event.target.checked){
            event.target.setAttribute("checked", true)
        }else{
            event.target.removeAttribute("checked")
        }
    }

    setExecVisualizations() {
        this.getVisualProperties("slider-resemblance")
            .getElementsByClassName("upscaler-slider")[0]
            .addEventListener('input',this.startSliderListeners);

        this.getVisualProperties("slider-hdr")
            .getElementsByClassName("upscaler-slider")[0]
            .addEventListener('input',this.startSliderListeners);

        this.getVisualProperties("slider-creativity")
            .getElementsByClassName("upscaler-slider")[0]
            .addEventListener('input',this.startSliderListeners);

        this.getVisualProperties("slider-cfg-scale")
            .getElementsByClassName("upscaler-slider")[0]
            .addEventListener('input',this.startSliderListeners);

        this.getVisualProperties("upscaler-sampler")
            .addEventListener('input',this.handleTextChange);

        this.getVisualProperties("upscaler-resolution")
            .addEventListener('input',this.handleTextChange);

        this.getVisualProperties("upscaler-seed")
            .addEventListener('input',this.handleInputChange);

        this.getVisualProperties("upscaler-step")
            .addEventListener('input',this.handleInputChange);

        this.getVisualProperties("guess")
            .addEventListener('change',this.checkUncheck);

        return super.setExecVisualizations();
    }

    removeExecVisualizations() {
        this.getVisualProperties("slider-resemblance")
            .getElementsByClassName("upscaler-slider")[0]
            .removeEventListener('input',this.startSliderListeners);

        this.getVisualProperties("slider-hdr")
            .getElementsByClassName("upscaler-slider")[0]
            .removeEventListener('input',this.startSliderListeners);

        this.getVisualProperties("slider-creativity")
            .getElementsByClassName("upscaler-slider")[0]
            .removeEventListener('input',this.startSliderListeners);

        this.getVisualProperties("slider-cfg-scale")
            .getElementsByClassName("upscaler-slider")[0]
            .removeEventListener('input',this.startSliderListeners);

        this.getVisualProperties("upscaler-sampler")
            .removeEventListener('input',this.handleTextChange);

        this.getVisualProperties("upscaler-resolution")
            .removeEventListener('input',this.handleTextChange);

        this.getVisualProperties("upscaler-seed")
            .removeEventListener('input',this.handleInputChange);

        this.getVisualProperties("upscaler-step")
            .removeEventListener('input',this.handleInputChange);

        this.getVisualProperties("guess")
            .removeEventListener('change',this.checkUncheck);

        return super.removeExecVisualizations();
    }

}