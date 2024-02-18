import {operatorHandler, setSelected} from "./operator.js";
import {fetchHTML} from "../constuctOperator.js";
import {promptGenerator, requestInterceptor} from "../api.js";

export class PromptMakerHandler extends operatorHandler {
    constructor(editor, nodeId) {
        super(editor, nodeId);
        const iDict = {
            "temperature": 1,
            "weight": 0,
            "text": "",
            "style": "photorealistic",
        }
        this.setInitialData(iDict)
    }

    changeTemperatureSlider() {
        const outputElement = this.getVisualProperties('chat-gpt-temperature-display');
        let temperature = parseFloat(this.getVisualProperties("chat-gpt-temperature").value);

        outputElement.textContent = temperature;

        this.updateNodeData({
            "temperature": temperature
        })
    }

    changeWeightSlider() {
        const outputElement = this.getVisualProperties('chat-gpt-weight-display');
        const negativeCheckbox =  this.getVisualProperties("chat-gpt-negative")
        const isNegative = negativeCheckbox ? negativeCheckbox.checked : false;

        let weight = parseFloat(this.getVisualProperties("chat-gpt-weight").value);

        if (isNegative) {
            weight *= -1;
        }

        outputElement.textContent = weight;

        this.updateNodeData({
            "weight": weight
        })
    }

    changeSign() {
        const weightSlider = this.getVisualProperties("chat-gpt-weight");
        const outputElement = weightSlider.parentElement.querySelector('.chat-gpt-weight-display');
        const isNegative = this.getVisualProperties("chat-gpt-negative").checked;

        let weight = parseFloat(weightSlider.value);

        if (isNegative) {
            weight *= -1;
        }

        this.updateNodeData({"weight": weight})
        outputElement["textContent"] = weight
    }

    checkPrompt() {
        const prompt = this.getVisualProperties("chat-gpt-prompt");
        this.updateNodeData({
            "text": prompt.value
        })

    }

    static async load(dataDict) {
        let html = await fetchHTML("promptMaker")
        const parse = new DOMParser()
        const doc = parse.parseFromString(html, "text/html")

        doc.getElementsByClassName('chat-gpt-temperature-display')[0]
            .textContent = dataDict["temperature"]

        doc.getElementsByClassName('chat-gpt-temperature')[0]
            .setAttribute("value", dataDict["temperature"])

        doc.getElementsByClassName('chat-gpt-prompt')[0]
            .textContent = dataDict["text"]

        const style = doc.getElementsByClassName("chat-gpt-prompt-style")[0]
        setSelected(dataDict["style"], style)

        const isNegative = dataDict["weight"] < 0
        doc.getElementsByClassName("chat-gpt-weight")[0]
            .setAttribute("value", Math.abs(dataDict["weight"]))

        doc.getElementsByClassName("chat-gpt-weight-display")[0].textContent = dataDict["weight"]

        if (isNegative){
            doc.getElementsByClassName("chat-gpt-negative")[0]
                .setAttribute("checked", true)
        }

        return doc.getElementsByClassName("visualization")[0].outerHTML
    }

    setExecVisualizations() {
        const prompt = this.getVisualProperties("chat-gpt-prompt");
        const stylePrompt = this.getVisualProperties("chat-gpt-prompt-style");
        const temperature = this.getVisualProperties("chat-gpt-temperature");
        const weight = this.getVisualProperties("chat-gpt-weight");
        const negative = this.getVisualProperties("chat-gpt-negative")

        temperature.addEventListener('input', () => this.changeTemperatureSlider());
        prompt.addEventListener('input', () => this.checkPrompt());
        stylePrompt.addEventListener('input', () => this.handleTextChange("style", "chat-gpt-prompt-style"));
        weight.addEventListener('input', () => this.changeWeightSlider());
        negative.addEventListener('input', () => this.changeSign());

        return super.setExecVisualizations();
    }

    removeExecVisualizations() {
        const prompt = this.getVisualProperties("chat-gpt-prompt");
        const stylePrompt = this.getVisualProperties("chat-gpt-prompt-style");
        const temperature = this.getVisualProperties("chat-gpt-temperature");
        const weight = this.getVisualProperties("chat-gpt-weight");
        const negative = this.getVisualProperties("chat-gpt-negative")

        temperature.removeEventListener('input', () => this.changeTemperatureSlider());
        prompt.removeEventListener('input', () => this.checkPrompt());
        stylePrompt.removeEventListener('input', () => this.handleTextChange("style", "chat-gpt-prompt-style"));
        weight.removeEventListener('input', () => this.changeWeightSlider());
        negative.removeEventListener('input', () => this.changeSign());

        return super.removeExecVisualizations();
    }

    async getOutputObject(inputObject) {

        const requestBody = {
            "temperature": this.getNodeData()["temperature"],
            "content": this.getNodeData()["text"],
            "style": this.getNodeData()["style"]
        }

        console.log(requestBody)
        console.log(this.getNodeData());

        let apiResponse;

        try {
            apiResponse = await requestInterceptor(promptGenerator, requestBody);
        } catch(error) {
            console.log(error);
        }
        console.log(apiResponse);

        return {
            "output_1": apiResponse[0],
            "output_2": apiResponse[1],
            "output_3": apiResponse[2],
            "output_4": apiResponse[3],
            "output_5": apiResponse[4],
        }
    }
}