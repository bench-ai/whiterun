import {operatorHandler} from "./operator.js";
import {realVisXLTextToImage, requestInterceptor} from "../api.js";

export class RealVisXLTextToImageHandler extends operatorHandler {
    constructor(editor, nodeId) {
        super(editor, nodeId);
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

    updateRealSeed(event) {
        if (event.target && event.target.classList.contains('real-vis-txt-to-img-seed')) {
            const seed = event.target;

            seed.addEventListener('blur', function() {
                let seedValue = parseFloat(seed.value);

                if (!isNaN(seedValue) && seedValue >= 0 && seedValue <= 4294967295) {
                    seed.value = seedValue;
                    seed.setAttribute("value", seedValue)
                } else {
                    if (isNaN(seedValue) || seed.value.trim() === '') {
                        seed.value = '';
                        seed.setAttribute("value", "");
                    } else {
                        seed.value = '0';
                        seed.setAttribute("value", "0");
                    }
                }
            });
        }
    }

    updateRealStep(event) {
        if (event.target && event.target.classList.contains('real-vis-txt-to-img-steps')) {
            const step = event.target;

            step.addEventListener('blur', function() {
                let stepValue = parseFloat(step.value);

                if (!isNaN(stepValue) && stepValue >= 1 && stepValue <= 50) {
                    step.value = stepValue;
                    step.setAttribute("value", stepValue)
                } else {
                    step.value = '40';
                    step.setAttribute("value", "30")
                }
            });
        }
    }

    updateRealGuidance(event) {
        if (event.target && event.target.classList.contains('real-vis-txt-to-img-guidance')) {
            const guidance = event.target;

            guidance.addEventListener('blur', function() {
                let guidanceValue = parseFloat(guidance.value);

                if (!isNaN(guidanceValue) && guidanceValue >= 1 && guidanceValue <= 30) {
                    guidance.value = guidanceValue;
                    guidance.setAttribute("value", guidanceValue)
                } else {
                    guidance.value = '7';
                    guidance.setAttribute("value", "7")
                }
            });
        }
    }

    checkPrompt(event) {
        const inputValue = event.target.value;
        event.target.setAttribute("value", inputValue)
        event.target["value"] = inputValue
        event.target.setAttribute("textContent", inputValue)
        event.target["textContent"] = inputValue
    }

    updateFilter() {
        const filterDisabled = this.getVisualProperties("real-vis-txt-to-img-safety").checked;

        if (filterDisabled){
            this.setField(this.getVisualProperties("real-vis-txt-to-img-safety"), "checked", filterDisabled)
        } else{
            this.deleteField(this.getVisualProperties("real-vis-txt-to-img-safety"), "checked")
        }
    }



    setExecVisualizations() {

        const sampler = this.getVisualProperties("real-vis-txt-to-img-sampler")
        this.deleteField(sampler, "disabled")
        sampler.addEventListener("input", this.handleTextChange)

        const step = this.getVisualProperties("real-vis-txt-to-img-steps")
        this.deleteField(step, "disabled")
        step.addEventListener('input', this.updateRealStep);

        const guidance = this.getVisualProperties("real-vis-txt-to-img-guidance")
        this.deleteField(guidance, "disabled")
        guidance.addEventListener('input', this.updateRealGuidance);

        const seed = this.getVisualProperties("real-vis-txt-to-img-seed")
        this.deleteField(seed, "disabled")
        seed.addEventListener('input', this.updateRealSeed);

        const disabledFilter = this.getVisualProperties("real-vis-txt-to-img-safety");
        disabledFilter.addEventListener('change', () => this.updateFilter());

        const positivePrompt = this.getVisualProperties("real-vis-txt-to-img-prompt");
        positivePrompt.addEventListener('input', this.checkPrompt);

        const negativePrompt = this.getVisualProperties("real-vis-txt-to-img-prompt-2");
        negativePrompt.addEventListener('input', this.checkPrompt);

        return super.setExecVisualizations();
    }

    removeExecVisualizations() {
        this.setField(this.getVisualProperties("real-vis-txt-to-img-sampler"), "disabled", "true")
        this.setField(this.getVisualProperties("real-vis-txt-to-img-steps"), "disabled", "true")
        this.setField(this.getVisualProperties("real-vis-txt-to-img-guidance"), "disabled", "true")
        this.setField(this.getVisualProperties("real-vis-txt-to-img-seed"), "disabled", "true")

        const disableFilter = this.getVisualProperties("real-vis-txt-to-img-safety");
        disableFilter.removeEventListener('change', () => this.updateFilter());

        const steps = this.getVisualProperties("real-vis-txt-to-img-steps")
        steps.removeEventListener('input', this.updateRealStep);

        const guidance = this.getVisualProperties("real-vis-txt-to-img-guidance")
        guidance.removeEventListener('input', this.updateRealGuidance);

        const seed = this.getVisualProperties("real-vis-txt-to-img-seed")
        seed.removeEventListener('input', this.updateRealSeed);

        const sampler = this.getVisualProperties("real-vis-txt-to-img-sampler")
        sampler.removeEventListener("input", this.handleTextChange)

        const positivePrompt = this.getVisualProperties("real-vis-txt-to-img-prompt");
        positivePrompt.removeEventListener('input', this.checkPrompt);

        const negativePrompt = this.getVisualProperties("real-vis-txt-to-img-prompt-2");
        negativePrompt.removeEventListener('input', this.checkPrompt);


        return super.removeExecVisualizations();
    }

    async getOutputObject(inputObject) {

        const sampler =this.getVisualProperties("real-vis-txt-to-img-sampler").value;
        const steps = parseFloat(this.getVisualProperties("real-vis-txt-to-img-steps").value);
        const guidance = parseFloat(this.getVisualProperties("real-vis-txt-to-img-guidance").value);
        const seed = parseFloat(this.getVisualProperties("real-vis-txt-to-img-seed").value);
        const positivePrompt = this.getVisualProperties("real-vis-txt-to-img-prompt").value;
        const negativePrompt = this.getVisualProperties("real-vis-txt-to-img-prompt-2").value;
        const disableFilter = this.getVisualProperties("real-vis-txt-to-img-safety").checked;

        const requestBody = {
            "prompt": positivePrompt,
            "negative_prompt" : negativePrompt,
            "scheduler": sampler,
            "guidance_scale": guidance,
            "num_inference_steps": steps,
            "disable_safety_checker": disableFilter
        };

        if (!isNaN(seed)) {
            requestBody.seed = seed;
        }

        let apiResponse;

        try {
            apiResponse = await requestInterceptor(realVisXLTextToImage, requestBody);
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