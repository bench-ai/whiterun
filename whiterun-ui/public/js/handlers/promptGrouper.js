import {operatorHandler} from "./operator.js";
import {fetchHTML} from "../constuctOperator.js";

export class promptGrouperHandler extends operatorHandler {

    constructor(editor, nodeId) {
        super(editor, nodeId);

        const iDict = {
            "display": [],
        }
        this.setInitialData(iDict)
    }

    updateVisualOutput(jOut) {
        this.updateNodeData({
            "display": jOut
        })

        if (typeof(jOut) === "object"){
            jOut = JSON.stringify(jOut, null, 3);
        }

        const output = this.getVisualProperties("prompt-group-display")
        output.textContent = jOut

    }

    static async load(dataDict){
        let html = await fetchHTML("promptGrouper")
        const parse = new DOMParser()
        const doc = parse.parseFromString(html, "text/html")

        if (dataDict.hasOwnProperty("display")){
            doc
                .getElementsByClassName("prompt-group-display")[0]
                .textContent = JSON.stringify(dataDict["display"], null, 3)
        }

        return doc.getElementsByClassName("visualization")[0].outerHTML
    }

    async getOutputObject(inputObject) {
        const combinedPrompts = [];

        for (let i = 1; i <= 5; i++) {
            const prompt = inputObject[`input_${i}`];

            if (prompt) {
                combinedPrompts.push({
                    "weight": prompt.weight,
                    "text": prompt.text,
                });
            }
        }

        this.updateVisualOutput(combinedPrompts);

        return {
            "output_1": combinedPrompts,
        };
    }
}