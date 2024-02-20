import {operatorHandler} from "./operator.js";
import {fetchHTML} from "../constuctOperator.js";

export class JsonDisplayHandler extends operatorHandler {

    constructor(editor, nodeId) {
        super(editor, nodeId);
        const iDict = {
            "display": "",
        }
        this.setInitialData(iDict)
    }

    static async load(dataDict){
        let html = await fetchHTML("jsonDisplay")
        const parse = new DOMParser()
        const doc = parse.parseFromString(html, "text/html")

        if (dataDict.hasOwnProperty("display")){
            doc.getElementsByClassName("json-output")[0].textContent = dataDict["display"]
        }

        return doc.getElementsByClassName("visualization")[0].outerHTML
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
        output.textContent = jOut

        this.updateNodeData({
            "display": jOut
        })
    }

    async getOutputObject(inputObject) {
        const data = inputObject["input_1"]
        console.log(data)
        if (data !== undefined){
            this.updateVisualOutput(inputObject["input_1"])
        }else{
            this.updateVisualOutput("")
            alert("Json Display Operator received no inputs")
        }
        return {}
    }
}