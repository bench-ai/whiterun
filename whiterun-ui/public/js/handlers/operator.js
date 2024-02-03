export class TypeCastingError extends Error {
    constructor(expectedType, receivedValue) {
        super(`Expected ${expectedType}, but received ${typeof receivedValue}`);
    }
}


export function checkOperatorTypes(type, value){

    const confirm = (type, value) => {
        let objectType;
        const valueType = typeof value

        if(Array.isArray(value)){
            objectType = "list";
        }else if(value === "null"){
            objectType = "null";
        }else{

            if (value instanceof Map){
                value = Object.fromEntries(value.entries());
            }
            switch (valueType.toLowerCase()){
                case 'number':
                    objectType = "number"
                    break
                case 'string':
                    objectType = "text"
                    break
                case 'boolean':
                    objectType = "boolean"
                    break
                case 'undefined':
                    objectType = "null"
                    break
                case "object":
                    objectType = "object"
                    if(value.hasOwnProperty("file_id") &&
                        value.hasOwnProperty("file") &&
                        value.hasOwnProperty("type") &&
                        value.hasOwnProperty("url")){

                        objectType = "file"
                    }
                    break;
                default:
                    throw new TypeCastingError("unknown", typeof(value).toLowerCase())
            }
        }

        if (objectType === type){
            return value
        }else{
            throw new TypeCastingError(type, typeof(value))
        }

    }

    const convert = (type, value) => {
        let cond1;
        let cond2;
        let cond3;
        let cond4;

        switch(type){
            case 'number':
                value = parseInt(value)
                if (isNaN(value)) {
                    throw new TypeCastingError("number", "string")
                }
                break;
            case 'list':
                try{
                    value = JSON.parse(value)
                }catch (error){
                    throw new TypeCastingError("list", "string")
                }
                break;
            case 'object':
                try{
                    value = JSON.parse(value)
                }catch (error){
                    throw new TypeCastingError("object", "string")
                }
                break;
            case 'null':
                value = value.toLowerCase()
                cond1 = (value === "none")
                cond2 = (value === "undefined")
                cond3 = (value === "null")
                cond4 = (value === "nan")

                if (cond1 || cond2 || cond3 || cond4){
                    value = null
                }else{
                    throw new TypeCastingError("null", "string")
                }
                break;
            case 'boolean':
                value = value.toLowerCase()
                cond1 = (value === "true")
                cond2 = (value === "false")
                cond3 = (value === "0")
                cond4 = (value === "1")

                if (cond1 || cond3){
                    value = true
                }else if (cond2 || cond4){
                    value = false
                }else{
                    throw new TypeCastingError("boolean", "string")
                }
                break;
            case 'file':
                try{
                    value = JSON.parse(value)
                }catch (error){
                    throw new TypeCastingError("object", "string")
                }

                if(!(value.hasOwnProperty("file_id") &&
                    value.hasOwnProperty("file") &&
                    value.hasOwnProperty("type") &&
                    value.hasOwnProperty("url"))){

                    throw new TypeCastingError("file", "object")
                }

                break;
            default:
                throw new TypeCastingError("unknown", typeof(value).toLowerCase())
        }

        return value
    }

    if (typeof (value) === "string"){
        if (type === "text"){
            return value
        }else{
            return convert(type, value)
        }
    }else{
        value = confirm(type, value)
        return value
    }
}


export class operatorHandler {

    constructor(editor, nodeId) {
        const match = nodeId.match(/\d+/);
        this._node_number = parseInt(match[0], 10)
        this._node = editor.getNodeFromId(this._node_number)
        const wholeNode = document.getElementById(nodeId);

        this._operatorDoc = wholeNode.getElementsByClassName("drawflow_content_node")[0].getElementsByClassName("box")[0];


        this._title = this._operatorDoc.getElementsByClassName("title-box")[0]
        this.isConnected = false
        this._updatedNodeMap = {}
        this.name = this._node.name

        console.log(this._node.data)
    }

    _checkTypeValid(outputType, inputType) {
        const stringSplit = (inputString) => {
            return inputString.split(" | ")
        }

        const inputList = stringSplit(inputType)
        const outputList = stringSplit(outputType)

        const fullLength = inputList.length + outputList.length

        const setLength = new Set([...inputList, ...outputList]).size

        return setLength === fullLength
    }

    connectOperators(operator2, inputNumber, outputNumber) {
        this.isConnected = true
        const inputNum = parseInt(inputNumber.match(/\d+/)[0], 10) - 1
        const outputNum = parseInt(outputNumber.match(/\d+/)[0], 10) - 1
        const inputFields = this._operatorDoc.getElementsByClassName("insert-field-dynamic")
        const field = inputFields.item(inputNum)

        const outputType = operator2._operatorDoc.getElementsByClassName("output-type").item(outputNum).textContent
        let inputType = this._operatorDoc.getElementsByClassName("field-header-dynamic").item(inputNum)
        inputType = inputType.getElementsByClassName("colored-text").item(0).textContent

        if (this._checkTypeValid(outputType, inputType)) {
            return false
        }

        if (field.value !== "") {
            return false
        } else {
            this.setField(field, "value", `supplied by operator ${operator2.name}`)
            this.setField(field, "disabled","true")
            return true
        }
    }

    disconnectOperator(inputNumber) {
        const num = parseInt(inputNumber.match(/\d+/)[0], 10) - 1
        const inputFields = this._operatorDoc.getElementsByClassName("insert-field-dynamic")
        const field = inputFields.item(num)

        this.setField(field, "value", "")
    }

    setField(field, attribute, value){
        field.setAttribute(attribute, value)
        field[attribute] = value
    }

    deleteField(field, attribute){
        field.removeAttribute(attribute)
    }

    getVisualizations() {
        return this._operatorDoc.getElementsByClassName("visualization")[0]
    }

    getVisualProperties(className) {
        return this.getVisualizations().getElementsByClassName(className)[0]
    }

    setExecVisualizations() {
        return true
    }

    removeExecVisualizations(){
        return true
    }

    async getOutputObject(inputObject){
        const inp = this._updatedNodeMap["inputs"]["dynamic"]

        for(let i = 1; i <= inp.length; i++){

            const inputName = `input_${i}`

            if (!inputObject.hasOwnProperty(inputName)){
                inputObject[inputName] = inp[i-1]["default_value"]
            }

            let typeList = inp[i-1]["type"].split(" | ")

            let valueSet = false;

            for (const type of typeList){
                try{
                    inputObject[inputName] = checkOperatorTypes(type, inputObject[inputName])
                    valueSet = true
                    break
                }catch (error){
                    console.log(error)
                }
            }

            if (!valueSet){
                throw new TypeCastingError(inp[i-1]["type"], typeof(inputObject[inputName]));
            }

        }

        return inputObject
    }

    checkOutputs(outputObject){

        const outputTypes = this._node.data["outputs"]
        for (let i = 0; i < outputTypes.length; i++){
            const value = outputObject[`output_${i+1}`]
            outputObject[`output_${i+1}`] = checkOperatorTypes(outputTypes[i]["type"], value)
        }

        return outputObject
    }
}