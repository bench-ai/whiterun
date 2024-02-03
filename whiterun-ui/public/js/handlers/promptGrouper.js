import {operatorHandler} from "./operator.js";

export class promptGrouperHandler extends operatorHandler {

    constructor(editor, nodeId) {
        super(editor, nodeId);
    }

    updateVisualOutput(jOut) {
        if (typeof(jOut) === "object"){
            jOut = JSON.stringify(jOut, null, 3);
        }

        const output = this.getVisualProperties("prompt-group-display")
        this.setField(output, "textContent", jOut)
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