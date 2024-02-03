import {operatorHandler} from "./operator.js";

export class ImagePromptHandler extends operatorHandler {
    constructor(editor, nodeId) {
        super(editor, nodeId);
    }

    changeWeightSlider(event) {
        if (event.target && event.target.classList.contains('ipo-weight')) {
            const outputElement = event.target.parentElement.querySelector('.ipo-weight-display');
            const negativeCheckbox = event.target.parentElement.querySelector('.ipo-negative');
            const isNegative = negativeCheckbox ? negativeCheckbox.checked : false;
            let weight = parseFloat(event.target.value);

            if (isNegative) {
                weight *= -1;
            }

            outputElement.textContent = weight;
            event.target.setAttribute("value", Math.abs(weight))
            outputElement.setAttribute("textContent", weight)
        }
    }

    checkPrompt(event) {
        const inputValue = event.target.value;
        event.target.setAttribute("value", inputValue)
        event.target["value"] = inputValue
        event.target.setAttribute("textContent", inputValue)
        event.target["textContent"] = inputValue
    }

    changeSign() {
        const weightSlider = this.getVisualProperties("ipo-weight");
        const outputElement = weightSlider.parentElement.querySelector('.ipo-weight-display');
        const isNegative = this.getVisualProperties("ipo-negative").checked;

        if (isNegative){
            this.setField(this.getVisualProperties("ipo-negative"), "checked", isNegative)
        }else{
            this.deleteField(this.getVisualProperties("ipo-negative"), "checked")
        }
        let weight = parseFloat(weightSlider.value);

        if (isNegative) {
            weight *= -1;
        }

        this.setField(outputElement, "textContent", weight)
    }

    setExecVisualizations() {

        const negativeCheckbox = this.getVisualProperties("ipo-negative");
        const prompt = this.getVisualProperties("ipo-prompt");
        const weight = this.getVisualProperties("ipo-weight");

        weight.addEventListener('input', this.changeWeightSlider);
        prompt.addEventListener('input', this.checkPrompt);
        negativeCheckbox.addEventListener('change', () => this.changeSign());

        return super.setExecVisualizations();
    }

    removeExecVisualizations() {

        const negativeCheckbox = this.getVisualProperties("ipo-negative");
        const prompt = this.getVisualProperties("ipo-prompt");
        const weight = this.getVisualProperties("ipo-weight");

        weight.removeEventListener('input', this.changeWeightSlider);
        prompt.removeEventListener('input', this.checkPrompt);
        negativeCheckbox.removeEventListener('change', () => this.changeSign());

        return super.removeExecVisualizations();
    }

    async getOutputObject(inputObject) {
        const weight = parseFloat(this.getVisualProperties("ipo-weight").value);
        const isNegative = this.getVisualProperties("ipo-negative").checked;

        let finalWeight = weight;
        if (isNegative) {
            finalWeight *= -1;
        }

        return this.checkOutputs({
            "output_1": {
                "weight": finalWeight,
                "text": this.getVisualProperties("ipo-prompt").value,
            }
        });
    }
}