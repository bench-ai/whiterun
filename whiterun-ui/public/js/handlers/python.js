import {operatorHandler} from "./operator.js";
import {evaluatePython} from "../pyodide.js";

export class PythonHandler extends operatorHandler {
    constructor(editor, nodeId) {
        super(editor, nodeId);
    }

    async getOutputObject(inputObject) {
        const python = this.getVisualProperties("python-text").textContent
        const ret = await evaluatePython(python, inputObject)

        return this.checkOutputs(Object.fromEntries(ret.entries()));
    }
}