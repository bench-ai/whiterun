import {operatorHandler} from "./operator.js";
import {fetchHTML} from "../constuctOperator.js";
import {chatGPTRequest, requestInterceptor} from "../api.js";

export class GPTHandler extends operatorHandler {
    constructor(editor, nodeId) {
        super(editor, nodeId);
        const iDict = {
            "temperature": 1,
            "text": "",
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

    checkPrompt() {
        const prompt = this.getVisualProperties("chat-gpt-prompt");
        this.updateNodeData({
            "text": prompt.value
        })

    }

    static async load(dataDict) {
        let html = await fetchHTML("chatGPT")
        const parse = new DOMParser()
        const doc = parse.parseFromString(html, "text/html")

        doc.getElementsByClassName('chat-gpt-temperature-display')[0]
            .textContent = dataDict["temperature"]

        doc.getElementsByClassName('chat-gpt-temperature')[0]
            .setAttribute("value", dataDict["temperature"])

        doc.getElementsByClassName('chat-gpt-prompt')[0]
            .textContent = dataDict["text"]

        return doc.getElementsByClassName("visualization")[0].outerHTML
    }

    setExecVisualizations() {
        const prompt = this.getVisualProperties("chat-gpt-prompt");
        const temperature = this.getVisualProperties("chat-gpt-temperature");

        temperature.addEventListener('input', () => this.changeTemperatureSlider());
        prompt.addEventListener('input', () => this.checkPrompt());

        return super.setExecVisualizations();
    }

    removeExecVisualizations() {
        const prompt = this.getVisualProperties("chat-gpt-prompt");
        const temperature = this.getVisualProperties("chat-gpt-temperature");

        temperature.removeEventListener('input', () => this.changeTemperatureSlider());
        prompt.removeEventListener('input', () => this.checkPrompt());

        return super.removeExecVisualizations();
    }

    async getOutputObject(inputObject) {

        const requestBody = {
            "temperature": this.getNodeData()["temperature"],
            "content": this.getNodeData()["text"]
        }

        let apiResponse;

        try {
            apiResponse = await requestInterceptor(chatGPTRequest, requestBody);
        } catch(error) {
            console.log(error);
        }
        console.log(apiResponse);

        return {
            "output_1": apiResponse
        }
    }
}