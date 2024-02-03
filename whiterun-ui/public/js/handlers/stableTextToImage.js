import {operatorHandler} from "./operator.js";
import {requestInterceptor, textToImage} from "../api.js";

export class textToImageHandler extends operatorHandler {
    constructor(editor, nodeId) {
        super(editor, nodeId);
    }

    updateHeightAndWidth(event) {

        const outerParent = event.target.parentElement.parentElement.parentElement

        const engineSelect = event.target.parentElement.querySelector('.txt-to-img-engine');
        const heightInput = outerParent.querySelector('.txt-to-img-height');
        const widthInput = outerParent.querySelector('.txt-to-img-width');


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
        heightInput.setAttribute("value", heightInput.value)
        widthInput.setAttribute("value", widthInput.value)
    }

    updateCfg(event) {
        if (event.target && event.target.classList.contains('txt-to-img-cfg')) {
            const cfg = event.target;

            cfg.addEventListener('blur', function() {
                let cfgValue = parseFloat(cfg.value);

                if (!isNaN(cfgValue) && cfgValue >= 0 && cfgValue <= 35) {
                    cfg.value = cfgValue;
                    cfg.setAttribute("value", cfgValue)
                } else {
                    cfg.value = '7';
                    cfg.setAttribute("value", "7")
                }
            });
        }
    }

    updateSeed(event) {
        if (event.target && event.target.classList.contains('txt-to-img-seed')) {
            const seed = event.target;

            seed.addEventListener('blur', function() {
                let seedValue = parseFloat(seed.value);

                if (!isNaN(seedValue) && seedValue >= 0 && seedValue <= 4294967295) {
                    seed.value = seedValue;
                    seed.setAttribute("value", seedValue)
                } else {
                    seed.value = '0';
                    seed.setAttribute("value", "0")
                }
            });
        }
    }

    updateStep(event) {
        if (event.target && event.target.classList.contains('txt-to-img-step')) {
            const step = event.target;

            step.addEventListener('blur', function() {
                let stepValue = parseFloat(step.value);

                if (!isNaN(stepValue) && stepValue >= 10 && stepValue <= 50) {
                    step.value = stepValue;
                    step.setAttribute("value", stepValue)
                } else {
                    step.value = '30';
                    step.setAttribute("value", "30")
                }
            });
        }
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
        const styleSelect = this.getVisualProperties("txt-to-img-style")
        this.deleteField(styleSelect, "disabled")
        styleSelect.addEventListener("input", this.handleTextChange)

        const engine = this.getVisualProperties("txt-to-img-engine")
        this.deleteField(engine, "disabled")
        engine.addEventListener("change", this.updateHeightAndWidth);
        engine.addEventListener("input", this.handleTextChange)

        const clip = this.getVisualProperties("txt-to-img-clip")
        this.deleteField(clip, "disabled")
        clip.addEventListener("input", this.handleTextChange)

        const sampler = this.getVisualProperties("txt-to-img-sampler")
        this.deleteField(sampler, "disabled")
        sampler.addEventListener("input", this.handleTextChange)

        const cfg = this.getVisualProperties("txt-to-img-cfg")
        this.deleteField(cfg, "disabled")
        cfg.addEventListener('input', this.updateCfg);

        const seed = this.getVisualProperties("txt-to-img-seed")
        this.deleteField(seed, "disabled")
        seed.addEventListener('input', this.updateSeed);

        const step = this.getVisualProperties("txt-to-img-step")
        this.deleteField(step, "disabled")
        step.addEventListener('input', this.updateStep);

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

        const styleSelect = this.getVisualProperties("txt-to-img-style")
        styleSelect.removeEventListener("input", this.handleTextChange)

        const engine = this.getVisualProperties("txt-to-img-engine")
        engine.removeEventListener("change", this.updateHeightAndWidth);
        engine.removeEventListener("input", this.handleTextChange)

        const clip = this.getVisualProperties("txt-to-img-clip")
        clip.removeEventListener("input", this.handleTextChange)

        const sampler = this.getVisualProperties("txt-to-img-sampler")
        sampler.removeEventListener("input", this.handleTextChange)

        const cfg = this.getVisualProperties("txt-to-img-cfg")
        cfg.removeEventListener('input', this.updateCfg);

        const seed = this.getVisualProperties("txt-to-img-seed")
        seed.removeEventListener('input', this.updateSeed);

        const step = this.getVisualProperties("txt-to-img-step")
        step.removeEventListener('input', this.updateStep);

        return super.setExecVisualizations();
    }


    async getOutputObject(inputObject) {

        const height = parseFloat(this.getVisualProperties("txt-to-img-height").value);
        const width = parseFloat(this.getVisualProperties("txt-to-img-width").value);
        const cfgScale = parseFloat(this.getVisualProperties("txt-to-img-cfg").value);
        const seed = parseFloat(this.getVisualProperties("txt-to-img-seed").value);
        const step = parseFloat(this.getVisualProperties("txt-to-img-step").value);

        let textPrompts = inputObject["input_1"]

        if (textPrompts) {
            if (Array.isArray(textPrompts)) {
            } else if (typeof textPrompts === "object") {
                textPrompts = [textPrompts];
            } else {
                textPrompts = [];
            }
        } else {
            textPrompts = [];
        }

        const requestBody = {
            "height": height,
            "width" : width,
            "text_prompts": textPrompts,
            "style_preset": this.getVisualProperties("txt-to-img-style").value,
            "engine_id": this.getVisualProperties("txt-to-img-engine").value,
            "clip_guidance_preset": this.getVisualProperties("txt-to-img-clip").value,
            "sampler": this.getVisualProperties("txt-to-img-sampler").value,
            "cfg_scale": cfgScale,
            "seed": seed,
            "steps": step,
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