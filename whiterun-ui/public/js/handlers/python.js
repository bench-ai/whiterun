import {operatorHandler} from "./operator.js";
import {evaluatePython} from "../pyodide.js";
import {fetchHTML} from "../constuctOperator.js";

export class PythonHandler extends operatorHandler {
    constructor(editor, nodeId) {
        super(editor, nodeId);

        const iDict = {
            "code": this.getVisualProperties("python-text").textContent,
        }

        this.setInitialData(iDict)
    }

    static async load(dataDict){

        let html = await fetchHTML("pythonViz")
        const parse = new DOMParser()
        const doc = parse.parseFromString(html, "text/html")
        const code = doc.getElementsByClassName("python-text")[0]

        console.log(dataDict)
        code.textContent = dataDict["code"]

        return doc.getElementsByClassName("visualization")[0].outerHTML
    }

    async getOutputObject(inputObject) {
        const python = this.getNodeData()["code"]
        const ret = await evaluatePython(python, inputObject)
        return this.checkOutputs(Object.fromEntries(ret.entries()));
    }
}