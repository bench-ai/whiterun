import {operatorHandler} from "./operator.js";

export class JsonDisplayHandler extends operatorHandler {

    constructor(editor, nodeId) {
        super(editor, nodeId);
    }

    updateVisualOutput(jOut){

        if (typeof(jOut) === "object"){
            jOut = JSON.stringify(jOut, null, 3);
        }
        else if(typeof(jOut) === "string"){
            if (jOut.startsWith("{") || jOut.startsWith("[")) {
                jOut = JSON.parse(jOut)
                jOut = JSON.stringify(jOut, null, 3);
            }
        }

        const output = this.getVisualProperties("json-output")
        this.setField(output,"textContent", jOut)
    }

    async getOutputObject(inputObject) {
        const data = inputObject["input_1"]
        if (data !== undefined){
            this.updateVisualOutput(inputObject["input_1"])
        }
        return {}
    }
}