import {operatorHandler, TypeCastingError} from "./operator.js";
import {fetchHTML} from "../constuctOperator.js";

export class ImagePromptHandler extends operatorHandler {
    constructor(editor, nodeId) {
        super(editor, nodeId);
        const iDict = {
            "weight": 1,
            "text": "",
        }
        this.setInitialData(iDict)
    }

    static async load(dataDict){

        if (typeof(dataDict["weight"]) !== "number"){
            throw new TypeCastingError("Invalid type")
        }

        if (typeof(dataDict["text"]) !== "string"){
            throw new TypeCastingError("Invalid type")
        }

        let html = await fetchHTML("imagePrompt")
        const parse = new DOMParser()
        const doc = parse.parseFromString(html, "text/html")

        const isNegative = dataDict["weight"] < 0
        doc.getElementsByClassName("ipo-weight")[0]
            .setAttribute("value", Math.abs(dataDict["weight"]))

        doc.getElementsByClassName("ipo-weight-display")[0].textContent = dataDict["weight"]

        if (isNegative){
            doc.getElementsByClassName("ipo-negative")[0]
                .setAttribute("checked", true)
        }

        doc.getElementsByClassName("ipo-prompt")[0].textContent = dataDict["text"]

        return doc.getElementsByClassName("visualization")[0].outerHTML
    }

    changeWeightSlider() {
        const outputElement = this.getVisualProperties('ipo-weight-display');
        const negativeCheckbox =  this.getVisualProperties("ipo-negative")
        const isNegative = negativeCheckbox ? negativeCheckbox.checked : false;

        let weight = parseFloat(this.getVisualProperties("ipo-weight").value);

        if (isNegative) {
            weight *= -1;
        }

        outputElement.textContent = weight;

        this.updateNodeData({
            "weight": weight
        })
    }

    checkPrompt() {
        const prompt = this.getVisualProperties("ipo-prompt");
        this.updateNodeData({
            "text": prompt.value
        })
    }

    changeSign() {
        const weightSlider = this.getVisualProperties("ipo-weight");
        const outputElement = weightSlider.parentElement.querySelector('.ipo-weight-display');
        const isNegative = this.getVisualProperties("ipo-negative").checked;

        let weight = parseFloat(weightSlider.value);

        if (isNegative) {
            weight *= -1;
        }

        this.updateNodeData({"weight": weight})
        outputElement["textContent"] = weight
    }

    setExecVisualizations() {

        const negativeCheckbox = this.getVisualProperties("ipo-negative");
        const prompt = this.getVisualProperties("ipo-prompt");
        const weight = this.getVisualProperties("ipo-weight");

        weight.addEventListener('input', () => this.changeWeightSlider());
        prompt.addEventListener('input', () => this.checkPrompt());
        negativeCheckbox.addEventListener('change', () => this.changeSign());

        return super.setExecVisualizations();
    }

    removeExecVisualizations() {

        const negativeCheckbox = this.getVisualProperties("ipo-negative");
        const prompt = this.getVisualProperties("ipo-prompt");
        const weight = this.getVisualProperties("ipo-weight");

        weight.removeEventListener('input', () => this.changeWeightSlider());
        prompt.removeEventListener('input', () => this.checkPrompt());
        negativeCheckbox.removeEventListener('change', () => this.changeSign());

        return super.removeExecVisualizations();
    }

    async getOutputObject(inputObject) {
        return this.checkOutputs({
            "output_1": this.getNodeData()
        });
    }
}