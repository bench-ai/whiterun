import {evaluatePython} from "./pyodide.js";
import {imageToImage, requestInterceptor, uploadImage} from "./api.js";


class TypeCastingError extends Error {
  constructor(expectedType, receivedValue) {
    super(`Expected ${expectedType}, but received ${typeof receivedValue}`);
  }
}

export function getOperator(nodeId, editor) {
  const idNode = "node-{id}".replace("{id}", nodeId)
  const op = new operatorHandler(editor, idNode);

  switch (op.name) {
    case 'slider':
      return new SliderHandler(editor, idNode)
    case 'text':
      return new TextHandler(editor, idNode)
    case 'python':
      return new PythonHandler(editor, idNode)
    case 'image':
      return new ImageHandler(editor, idNode)
    case 'jsonDisplay':
      return new JsonDisplayHandler(editor, idNode)
    case 'weightedPrompt':
      return new ImagePromptHandler(editor, idNode)
    case 'promptGrouper':
      return new promptGrouperHandler(editor, idNode)
    case 'textToImage':
      return new textToImageHandler(editor,idNode)
    case 'imageDisplay':
      return new ImageDisplayHandler(editor,idNode)
    case 'imageToImage':
      return new ImageToImageHandler(editor, idNode)
    default:
      throw new ReferenceError("operator does not exist")
  }
}

function checkOperatorTypes(type, value){

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


class operatorHandler {

  constructor(editor, nodeId) {
    const match = nodeId.match(/\d+/);
    this._node_number = parseInt(match[0], 10)
    this._node = editor.getNodeFromId(this._node_number)
    const wholeNode = document.getElementById(nodeId);

    this._operatorDoc = wholeNode.getElementsByClassName("drawflow_content_node")[0].getElementsByClassName("box")[0];


    this._title = this._operatorDoc.getElementsByClassName("title-box")[0]
    this.isConnected = false
    this._updatedNodeMap = {}
    this._lastInputs = {}
    this.getUpdatedNodeData()
    this.name = this._node.name
  }

  _updateMap(cssClass) {
    const inputFields = this._operatorDoc.getElementsByClassName(`insert-field-${cssClass}`)
    const header = this._operatorDoc.getElementsByClassName(`field-header-${cssClass}`)

    const nodeArrMap = this._node.data["inputs"][`${cssClass}`]
    const lastInputs = []

    for (let i = 0; i < inputFields.length; i++) {
      let headerName = header.item(i).textContent
      headerName = headerName.split(":")[0]
      headerName = headerName.replace(/\s/g, '');
      nodeArrMap[i]["name"] = headerName
      lastInputs.push(nodeArrMap[i]["default_value"])

      if (cssClass !== "static") {
        if (inputFields.item(i).disabled) {
          this.isConnected = true;
        }
      }
      nodeArrMap[i]["default_value"] = inputFields.item(i).value
      this.setField( inputFields.item(i), "value", inputFields.item(i).value)
      // inputFields.item(i).setAttribute("value", inputFields.item(i).value)
    }
    return [nodeArrMap, lastInputs]
  }

  getUpdatedNodeData() {

    const staticList = this._updateMap("static")
    const dynamicList = this._updateMap("dynamic")
    const nodeMap = this._node.data

    this._lastInputs = {
      "static": staticList[1],
      "dynamic": dynamicList[1]
    }

    nodeMap["inputs"]["static"] = staticList[0]
    nodeMap["inputs"]["dynamic"] = dynamicList[0]

    this._updatedNodeMap = nodeMap;
    return nodeMap
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

    if (field.disabled) {
      return false
    } else {
      // field.value = "supplied by operator {opName}".replace("{opName}", operator2.name)
      // field.disabled = true
      this.setField(field, "value", `supplied by operator ${operator2.name}`)
      // field.setAttribute("value", `supplied by operator ${operator2.name}`)
      this.setField(field, "disabled","true")
      return true
    }
  }

  disconnectOperator(inputNumber, substitute_value, editor) {
    const num = parseInt(inputNumber.match(/\d+/)[0], 10) - 1
    const inputFields = this._operatorDoc.getElementsByClassName("insert-field-dynamic")
    const field = inputFields.item(num)

    // field.value = substitute_value
    // field.disabled = false
    // field.setAttribute("value", substitute_value)
    // field.setAttribute("disabled", "false")

    this.deleteField(field, "disabled")
    this.setField(field, "value", substitute_value)

    this.getUpdatedNodeData()

    if (this.updateVisualizations()) {
      this.saveNodeData(editor)
      return true;
    } else {
      console.log("here")
      this.resetInputFields()
      field.disabled = true;
      this.deleteField(field, "disabled")
      // field.setAttribute("disabled", "true")
      return false
    }
  }

  _resetField(cls) {
    const inputFields = this._operatorDoc.getElementsByClassName(`insert-field-${cls}`)
    for (let i = 0; i < inputFields.length; i++) {
      // inputFields.item(i).value = this._lastInputs[cls][i]
      // inputFields.item(i).setAttribute("value", this._lastInputs[cls][i])
      this.setField(inputFields.item(i), "value", this._lastInputs[cls][i])
    }
  }

  resetInputFields() {
    this._resetField("static")
    this._resetField("dynamic")
  }

  setField(field, attribute, value){
    field.setAttribute(attribute, value)
    field[attribute] = value
  }

  deleteField(field, attribute){
    field.removeAttribute(attribute)
  }

  saveNodeData(editor) {
    editor.updateNodeDataFromId(this._node_number, this._updatedNodeMap)
  }

  getVisualizations() {
    return this._operatorDoc.getElementsByClassName("visualization")[0]
  }

  getVisualProperties(className) {
    return this.getVisualizations().getElementsByClassName(className)[0]
  }

  updateVisualizations() {
    return true
  }

  setExecVisualizations() {
    return true
  }

  removeExecVisualizations(){
    return true
  }

  updateConnectedVisualization() {
    return true
  }

  getInputValue(fieldNumber, cls) {
    return this._updatedNodeMap["inputs"][cls][fieldNumber]["default_value"]
  }

  lockInputFields() {

    const gatherElements = (className) => {
      const inputFields = this._operatorDoc.getElementsByClassName(`insert-field-${className}`)

      for (let i = 0; i < inputFields.length; i++) {
        inputFields.item(i).disabled = true;
        inputFields.item(i).setAttribute("disabled", "true")
      }
    }

    gatherElements("static")
    gatherElements("dynamic")
  }

  unlockInputFields(){

    const gatherElements = (className, notIndexArr) => {
      const inputFields = this._operatorDoc.getElementsByClassName(`insert-field-${className}`)

      for (let i = 0; i < inputFields.length; i++) {
        if(!notIndexArr.includes(i)){
          inputFields.item(i).disabled = false;
          // console.log("here")
          this.deleteField(inputFields.item(i), "disabled")
          // inputFields.item(i).removeAttribute("disabled")
        }
      }
    }

    gatherElements("static", [])

    const inputArr = []

    Object.keys(this._node.inputs).forEach((key) => {
      if(this._node.inputs[key]["connections"].length > 0){
        inputArr.push(parseInt(key.match(/\d+/)[0], 10) - 1)
      }
    })

    gatherElements("dynamic", inputArr)

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

    const outputTypes = this._updatedNodeMap["outputs"]
    for (let i = 0; i < outputTypes.length; i++){
      const value = outputObject[`output_${i+1}`]
      outputObject[`output_${i+1}`] = checkOperatorTypes(outputTypes[i]["type"], value)
    }

    return outputObject
  }
}


export class SliderHandler extends operatorHandler {
  constructor(editor, nodeId) {
    super(editor, nodeId);
  }

  getIntInputValue(fieldNumber) {
    const val = parseInt(this.getInputValue(fieldNumber, "static"))
    if (isNaN(val)) {
      throw new TypeCastingError("int", "string")
    } else {
      return val
    }
  }

  updateVisualizations() {

    const sliderOut = this.getVisualProperties("slider-operator-output")
    const sliderName = this.getVisualProperties("slider-operator-name")
    const slider = this.getVisualProperties("slider-operator")

    try {
      const sliderMin = this.getIntInputValue(1)
      const sliderMax = this.getIntInputValue(2)
      const sliderValue = this.getIntInputValue(3)

      const cond1 = (sliderMin >= sliderMax)
      const cond2 = ((sliderValue < sliderMin) || (sliderValue > sliderMax))

      if (!(cond1 || cond2)) {
        // sliderOut.textContent = sliderValue.toString()
        this.setField(sliderOut, "textContent", sliderValue.toString())

        // sliderName.textContent = this.getInputValue(0, "static")
        this.setField(sliderName, "textContent", this.getInputValue(0, "static"))

        // slider.min = sliderMin.toString()
        this.setField(slider, "min", sliderMin.toString())

        // slider.max = sliderMax.toString()
        this.setField(slider, "max", sliderMax.toString())

        // slider.value = sliderValue.toString()
        this.setField(slider, "value", sliderValue.toString())

        return super.updateVisualizations()
      } else {
        return false
      }
    } catch (error) {
      if (error instanceof TypeCastingError) {
        console.log("improperTypeProvided")
      }

      return false
    }
  }

  changeSlider(event){
    if (event.target && event.target.classList.contains('slider-operator')) {

      const outputElement = event.target.parentElement.querySelector('.slider-operator-output');
      outputElement.textContent = event.target.value;

      outputElement.setAttribute("textContent", event.target.value)
      event.target.setAttribute("value", event.target.value)
    }
  }

  setExecVisualizations() {
    const slider = this.getVisualProperties("slider-operator")
    // slider.disabled = false;
    this.deleteField(slider, "disabled")

    this.getVisualizations().addEventListener('input', this.changeSlider);
    return super.setExecVisualizations()
  }

  removeExecVisualizations() {
    const slider = this.getVisualProperties("slider-operator")
    // slider.disabled = true;
    // slider.setAttribute("disabled", "true")

    this.setField(slider, "disabled", "true")

    this.getVisualizations().removeEventListener('input', this.changeSlider)
    return super.removeExecVisualizations();
  }

  async getOutputObject(inputObject) {
    return this.checkOutputs({
      "output_1": parseInt(this.getVisualProperties("slider-operator").value)
    })
  }
}


export class PythonHandler extends operatorHandler {
  constructor(editor, nodeId) {
    super(editor, nodeId);
  }

  async getOutputObject(inputObject) {
    inputObject = await super.getOutputObject(inputObject)
    console.log(inputObject)
    const python = this.getVisualProperties("python-text").textContent
    const ret = await evaluatePython(python, inputObject)

    // this.checkOutputs()
    return this.checkOutputs(Object.fromEntries(ret.entries()));
  }
}


export class ImageHandler extends operatorHandler {
  constructor(editor, nodeId) {
    super(editor, nodeId);
  }

  updateVisualizations() {

    const name = this.getVisualProperties("image-operator-name")
    name.textContent = this.getInputValue(1, "static")

    this.setField(name, "textContent", this.getInputValue(1, "static"))

    try {
      let js = JSON.parse(this.getInputValue(0, "static"))
      if (typeof (js) !== "object") {
        return false
      } else {
        return super.updateVisualizations()
      }
    } catch (exception) {
      return false
    }
  }

  async changeInput(event){
    if (event.target && event.target.classList.contains('image-input')) {
      const fileInput = event.target;
      const imageElement = fileInput.parentElement.querySelector('.image-op-file');

      if (fileInput.files && fileInput.files[0]) {
        const reader = new FileReader();

        reader.onload = function(e) {
          imageElement.src = e.target.result;
        };

        reader.readAsDataURL(fileInput.files[0]);
      }
    }
  }

  async getOutputObject(inputObject) {

    const fileInput = this.getVisualProperties("image-input")
    const body = await requestInterceptor(uploadImage, fileInput, true)
    console.log(body)

    // this.checkOutputs()
    return this.checkOutputs({
      "output_1": {
        "type": "image",
        "file_id": body["key"],
        "file":  fileInput.files[0],
        "url": ""
      }
    });
  }

  setExecVisualizations() {
    const imageButton = this.getVisualProperties("image-input")
    // imageButton.disabled = false;
    this.deleteField(imageButton,"disabled")
    this.getVisualizations().addEventListener('change', this.changeInput);
    return super.setExecVisualizations();
  }

  removeExecVisualizations() {
    const imageButton = this.getVisualProperties("image-input")
    // imageButton.disabled = true;
    this.setField(imageButton,"disabled", "true")
    this.getVisualizations().removeEventListener('change', this.changeInput)
    return super.removeExecVisualizations();
  }
}

export class TextHandler extends operatorHandler {
  constructor(editor, nodeId) {
    super(editor, nodeId);
  }

  updateVisualizations() {
    let name = this.getVisualProperties("text-operator-name")
    let content = this.getVisualProperties("text-input")
    // content.textContent = this.getInputValue(1, "static")
    // name.textContent = this.getInputValue(0, "static")

    this.setField(content, "textContent", this.getInputValue(1, "static"))
    this.setField(name,"textContent", this.getInputValue(0, "static"))
    return super.updateVisualizations()
  }

  changeText(event){
    if (event.target && event.target.classList.contains('text-input')) {

      // const outputElement = event.target.parentElement.querySelector('.slider-operator-output');
      // outputElement.textContent = event.target.value;

      console.log(event.target.textContent)

      event.target.setAttribute("value", event.target.value)
      event.target.textContent = event.target.value
    }
  }

  setExecVisualizations() {
    const imageButton = this.getVisualProperties("text-input")
    // imageButton.readOnly = false;
    this.deleteField(imageButton,"readOnly")
    imageButton.addEventListener('input', this.changeText)
    return super.setExecVisualizations();
  }

  removeExecVisualizations() {
    const imageButton = this.getVisualProperties("text-input")
    // imageButton.readOnly = true;
    this.setField(imageButton,"readOnly", "true")
    imageButton.removeEventListener('input', this.changeText)
    return super.removeExecVisualizations();
  }
}

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
    // output.textContent = jOut
    this.setField(output,"textContent", jOut)
  }

  updateVisualizations() {
    try {
      let jOut = this.getInputValue(0, "dynamic")

      if (jOut.startsWith("{") || jOut.startsWith("[")) {
        jOut = JSON.parse(jOut)
        jOut = JSON.stringify(jOut, null, 3);
      }

      const output = this.getVisualProperties("json-output")
      let jName = this.getVisualProperties("json-operator-name")

      this.setField(output,"textContent", jOut)
      this.setField(jName,"textContent", this.getInputValue(0, "static"))

      return super.updateVisualizations()

    } catch (error) {
      return false
    }
  }

  async getOutputObject(inputObject) {
    const data = inputObject["input_1"]
    if (data !== undefined){
      this.updateVisualOutput(inputObject["input_1"])
    }
    return {}
  }
}

export class ImagePromptHandler extends operatorHandler {
  constructor(editor, nodeId) {
    super(editor, nodeId);
  }

  getIntInputValue(fieldNumber) {
    const val = parseFloat(this.getInputValue(fieldNumber, "static"))
    if (isNaN(val)) {
      throw new TypeCastingError("int", "string")
    } else {
      return val
    }
  }

  updateVisualizations() {
    let name = this.getInputValue(0, "static");
    const prompt = this.getInputValue(1, "static");
    const negative = this.getInputValue(2, "static").toLowerCase();
    let weight;

    // this.getVisualProperties("ipo-name").textContent = name;
    this.setField(this.getVisualProperties("ipo-name"), "textContent", name)

    try{
      weight = this.getIntInputValue(3);
    }catch (error){
      return false
    }

    if ((0 <= weight) && (weight <= 2)) {
      // this.getVisualProperties("ipo-weight").value = weight;
      // this.getVisualProperties("ipo-weight-display").textContent = weight;

      this.setField(this.getVisualProperties("ipo-weight"), "value", weight)
      this.setField(this.getVisualProperties("ipo-weight-display"), "textContent", weight)


    } else {
      return false;
    }

    const isNegative = negative === "true";

    // this.getVisualProperties("ipo-negative").checked = isNegative;
    this.setField(this.getVisualProperties("ipo-negative"), "checked", isNegative)

    if (isNegative) {
      weight = weight * -1;
      // this.getVisualProperties("ipo-weight").value = weight * -1;
      // this.getVisualProperties("ipo-weight-display").textContent = weight;

      this.setField(this.getVisualProperties("ipo-weight"), "value", weight * -1)
      this.setField(this.getVisualProperties("ipo-weight-display"), "textContent", weight)
    }
    // this.getVisualProperties("ipo-prompt").textContent = prompt;
    this.setField(this.getVisualProperties("ipo-prompt"), "textContent", prompt)


    return super.updateVisualizations();
  }

  changeWeightSlider(event) {
    if (event.target && event.target.classList.contains('ipo-weight')) {
      const outputElement = event.target.parentElement.querySelector('.ipo-weight-display');
      const negativeCheckbox = document.querySelector('.ipo-negative');
      const isNegative = negativeCheckbox ? negativeCheckbox.checked : false;
      let weight = parseFloat(event.target.value);

      if (isNegative) {
        weight *= -1;
      }

      outputElement.textContent = weight;
      event.target.setAttribute("value", Math.abs(weight))
      outputElement.setAttribute("textContent", weight)
    }
  }

  changeSign() {
    const weightSlider = this.getVisualProperties("ipo-weight");
    const outputElement = weightSlider.parentElement.querySelector('.ipo-weight-display');
    const isNegative = this.getVisualProperties("ipo-negative").checked;
    let weight = parseFloat(weightSlider.value);

    if (isNegative) {
      weight *= -1;
    }

    // outputElement.textContent = weight;
    this.setField(outputElement, "textContent", weight)
  }

  setExecVisualizations() {
    this.getVisualProperties("ipo-name").disabled = false;
    this.getVisualProperties("ipo-weight").disabled = false;
    this.getVisualProperties("ipo-prompt").readOnly = false;

    const negativeCheckbox = this.getVisualProperties("ipo-negative");
    // negativeCheckbox.disabled = false;
    this.deleteField(negativeCheckbox, "disabled")

    this.getVisualizations().addEventListener('input', this.changeWeightSlider);
    negativeCheckbox.addEventListener('change', () => this.changeSign());

    return super.setExecVisualizations();
  }

  removeExecVisualizations() {

    this.setField(this.getVisualProperties("ipo-name"), "disabled", "true")
    this.setField(this.getVisualProperties("ipo-weight"), "disabled", "true")
    this.setField(this.getVisualProperties("ipo-negative"), "disabled", "true")
    this.setField(this.getVisualProperties("ipo-prompt"), "readOnly", "true")

    this.getVisualizations().removeEventListener('input', this.changeWeightSlider)

    const negativeCheckbox = this.getVisualProperties("ipo-negative");
    negativeCheckbox.removeEventListener('change', () => this.changeSign());

    return super.removeExecVisualizations();
  }

  async getOutputObject(inputObject) {
    const weight = parseFloat(this.getVisualProperties("ipo-weight").value);
    const isNegative = this.getVisualProperties("ipo-negative").checked;

    let finalWeight = weight;
    if (isNegative) {
      finalWeight *= -1;
    }

    return this.checkOutputs({
      "output_1": {
        "weight": finalWeight,
        "text": this.getVisualProperties("ipo-prompt").value,
      }
    });
  }
}

export class promptGrouperHandler extends operatorHandler {
  constructor(editor, nodeId) {
    super(editor, nodeId);
  }

  updateVisualizations() {

    let name = this.getVisualProperties("prompt-group-name");
    // name.textContent = this.getInputValue(0, "static");
    this.setField(name, "textContent", this.getInputValue(0, "static"))
    let prompts = [];

    for (let i = 0; i < 5; i++) {
      let prompt = this.getInputValue(i, "dynamic");

      if (prompt.startsWith("{") || prompt.startsWith("[")) {
        prompt = JSON.parse(prompt);
        prompt = JSON.stringify(prompt, null, 3);
      }

      prompts.push(prompt);
    }

    // Filter out undefined prompts
    prompts = prompts.filter((prompt) => prompt !== undefined);

    const output = this.getVisualProperties("prompt-group-display");
    // output.textContent = JSON.stringify(prompts, null, 3);
    this.setField(output, "textContent", JSON.stringify(prompts, null, 3))

    return super.updateVisualizations();
  }

  updateVisualOutput(jOut) {
    if (typeof(jOut) === "object"){
      jOut = JSON.stringify(jOut, null, 3);
    }

    const output = this.getVisualProperties("prompt-group-display")
    // output.textContent = jOut
    this.setField(output, "textContent", jOut)
  }

  async getOutputObject(inputObject) {
    // inputObject = await super.getOutputObject(inputObject)
    const combinedPrompts = [];

    for (let i = 1; i <= 5; i++) {
      const prompt = inputObject[`input_${i}`];

      // Check if the prompt exists
      if (prompt) {

        combinedPrompts.push({
          "weight": prompt.weight,
          "prompt": prompt.prompt,
        });
      }
    }

    // Update visual output with the combined prompts
    this.updateVisualOutput(combinedPrompts);

    return {
      "output_1": combinedPrompts,
    };
  }

}

export class textToImageHandler extends operatorHandler {
  constructor(editor, nodeId) {
    super(editor, nodeId);
    console.log("entered constructor");

  }

  updateHeightAndWidth(event) {
    const engineSelect = document.querySelector('.txt-to-img-engine');
    const heightInput = document.querySelector('.txt-to-img-height');
    const widthInput = document.querySelector('.txt-to-img-width');

    const engineValue = engineSelect.value;

    switch (engineValue) {
      case "SDXL Beta":
        heightInput.value = 512;
        widthInput.value = 896;
        break;
      case "SDXL v0.9":
        heightInput.value = 832;
        widthInput.value = 1216;
        break;
      case "SDXL v1.0":
        heightInput.value = 832;
        widthInput.value = 1216;
        break;
      case "SD v1.6":
        heightInput.value = 832;
        widthInput.value = 1216;
        break;
      default:
        heightInput.value = 512;
        widthInput.value = 512;
    }
  }

  getIntInputValue(fieldNumber) {
    const val = parseFloat(this.getInputValue(fieldNumber, "static"))
    if (isNaN(val)) {
      throw new TypeCastingError("int", "string")
    } else {
      return val
    }
  }

  updateVisualizations() {
    let name = this.getInputValue(0, "static");
    let seed;

    this.setField(this.getVisualProperties("txt-to-img-name"), "textContent", name)
    try {
      seed = this.getIntInputValue(1)
    } catch (error) {
      return false
    }

    if ((0 <= seed) && (seed <= 4294967295)) {
      this.setField(this.getVisualProperties("txt-to-img-seed"), "value", seed)
    } else {
      return false;
    }

    try {
      let prompt = this.getInputValue(0, "dynamic")

      if (prompt.startsWith("{") || prompt.startsWith("[")) {
        prompt = JSON.parse(prompt)
        prompt = JSON.stringify(prompt, null, 3);
      }

      const output = this.getVisualProperties("txt-to-img-prompt")

      this.setField(output, "textContent", prompt)

      return super.updateVisualizations();

    } catch (error) {
      return false
    }
  }

  setExecVisualizations() {
    this.getVisualProperties("txt-to-img-style").disabled = false;
    this.getVisualProperties("txt-to-img-prompt").readOnly = false;
    this.getVisualProperties("txt-to-img-engine").disabled = false;
    this.getVisualProperties("txt-to-img-clip").disabled = false;
    this.getVisualProperties("txt-to-img-sampler").disabled = false;
    this.getVisualProperties("txt-to-img-cfg").disabled = false;
    this.getVisualProperties("txt-to-img-seed").disabled = false;
    this.getVisualProperties("txt-to-img-step").disabled = false;

    const engineSelect = this.getVisualProperties("txt-to-img-engine");
    engineSelect.addEventListener("change", this.updateHeightAndWidth);

    return super.setExecVisualizations();
  }

  removeExecVisualizations() {
    this.setField(this.getVisualProperties("txt-to-img-style"), "disabled", "true")
    this.setField(this.getVisualProperties("txt-to-img-prompt"), "readOnly", "true")
    this.setField(this.getVisualProperties("txt-to-img-engine"), "disabled", "true")
    this.setField(this.getVisualProperties("txt-to-img-clip"), "disabled", "true")
    this.setField(this.getVisualProperties("txt-to-img-sampler"), "disabled", "true")
    this.setField(this.getVisualProperties("txt-to-img-cfg"), "disabled", "true")
    this.setField(this.getVisualProperties("txt-to-img-seed"), "disabled", "true")
    this.setField(this.getVisualProperties("txt-to-img-step"), "disabled", "true")



    return super.setExecVisualizations();
  }

  updateVisualOutput(jOut) {
    if (typeof(jOut) === "object"){
      jOut = JSON.stringify(jOut, null, 3);
    }
    else if(typeof(jOut) === "string"){
      if (jOut.startsWith("{") || jOut.startsWith("[")) {
        jOut = JSON.parse(jOut)
        jOut = JSON.stringify(jOut, null, 3);
      }
    }

    const output = this.getVisualProperties("txt-to-img-prompt")
    this.setField(output, "textContent", jOut)

  }

  async getOutputObject(inputObject) {

    const height = parseFloat(this.getVisualProperties("txt-to-img-height").value);
    const width = parseFloat(this.getVisualProperties("txt-to-img-width").value);
    const cfgScale = parseFloat(this.getVisualProperties("txt-to-img-cfg").value);
    const seed = parseFloat(this.getVisualProperties("txt-to-img-seed").value);
    const step = parseFloat(this.getVisualProperties("txt-to-img-step").value);

    const data = inputObject["input_1"]
    if (data !== undefined){
      this.updateVisualOutput(inputObject["input_1"])
    }

    return this.checkOutputs({
      "output_1": {
        "height": height,
        "width" : width,
        "text_prompts": this.getVisualProperties("txt-to-img-prompt").value,
        "style_preset": this.getVisualProperties("txt-to-img-style").value,
        "engine_id": this.getVisualProperties("txt-to-img-engine").value,
        "clip_guidance_preset": this.getVisualProperties("txt-to-img-clip").value,
        "sampler": this.getVisualProperties("txt-to-img-sampler").value,
        "cfg_scale": cfgScale,
        "seed": seed,
        "steps": step,
      }
    });
  }



}

export class ImageDisplayHandler extends operatorHandler {

  constructor(editor, nodeId) {
    super(editor, nodeId);
    this._image_set = false
  }
  setExecVisualizations() {

    this.deleteField(this.getVisualProperties("download-Button"), "disabled")
    this.getVisualProperties("download-Button").addEventListener('click', this.downloadImage);

    return super.setExecVisualizations();
  }

  removeExecVisualizations() {
    this.setField(this.getVisualProperties("download-Button"), "disabled", "true")
    this.getVisualProperties("download-Button").removeEventListener('click', this.downloadImage);

    if (this._image_set){
      console.log("entered here2")
      this.getVisualProperties("download-Button").removeEventListener('click', this.downloadImage);
    }

    return super.removeExecVisualizations();
  }


  downloadImage(event) {

    console.log(event)

    const visualizationElement = event.target.closest('.visualization');
    const imageElement = visualizationElement.querySelector('.image-op-file');

    let fc = (base64String) =>{
      const matches = base64String.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64/);

      if (matches && matches.length > 1) {
        return matches[1];
      } else {
        // Default to a generic type if MIME type cannot be determined
        return 'application/octet-stream';
      }
    }

    // const fileId =  this.fileId
    // Create an invisible anchor element
    const a = document.createElement('a');
    a.style.display = 'none';

    const mime = fc(imageElement.src).split("/")[1]

    // Set the download URL and filename
    a.href = imageElement.src
    a.download = `result.${mime}`;
    a.target = "_blank"
    a.rel = "noopener noreferrer"

    // Append the anchor to the document and trigger a click event
    document.body.appendChild(a);
    a.click();

    // Remove the anchor from the document
    document.body.removeChild(a);
  }

  async getOutputObject(inputObject) {
    const data = inputObject["input_1"]

    console.log(data)

    if (data["type"] === "image"){

      if(data["url"] !== "") {
        const imageElement = this.getVisualProperties("image-op-file")
        imageElement.src = data["url"]

      } else if (data["file"] !== null){

        const imageElement = this.getVisualProperties("image-op-file")

        const reader = new FileReader();

        reader.onload = function(e) {
          imageElement.src = e.target.result;
        };

        reader.readAsDataURL(data["file"]);

      } else{
        throw new Error("unable to utilize data")
      }

      this._image_set = true
      return {}
    }else{
      throw new Error("can only work with image data")
    }
  }
}

export class ImageToImageHandler extends operatorHandler {


  handleInputChange(event) {
    const inputValue = event.target.value;
    event.target.setAttribute("value", inputValue)
    event.target["value"] = inputValue
  }

  handleTextChange(event) {
    const inputValue = event.target.value;

    const targetList = event.target.getElementsByTagName("option")

    const targetObject = {}

    for (let i = 0; i < targetList.length; i++){
      targetObject[targetList[i].value] = {
        "number": i,
        "text": targetList[i].textContent
      }

      targetList[i].removeAttribute("selected")
    }

    targetList[targetObject[inputValue]["number"]].setAttribute("selected", "true")
    targetList[targetObject[inputValue]["number"]]["selected"] = "true"

  }

  setExecVisualizations() {
    this.deleteField(this.getVisualProperties("txt-to-img-style"), "disabled");
    this.deleteField(this.getVisualProperties("txt-to-img-engine"), "disabled");
    this.deleteField(this.getVisualProperties("txt-to-img-clip"), "disabled");
    this.deleteField(this.getVisualProperties("txt-to-img-sampler"), "disabled");
    this.deleteField(this.getVisualProperties("txt-to-img-cfg"), "disabled");
    this.deleteField(this.getVisualProperties("txt-to-img-seed"), "disabled");
    this.deleteField(this.getVisualProperties("txt-to-img-step"), "disabled");
    this.deleteField(this.getVisualProperties("txt-to-img-strength"), "disabled");

    this.getVisualProperties("txt-to-img-style")
        .addEventListener('input',this.handleTextChange);

    this.getVisualProperties("txt-to-img-engine")
        .addEventListener('input',this.handleTextChange);

    this.getVisualProperties("txt-to-img-clip")
        .addEventListener('input',this.handleTextChange);

    this.getVisualProperties("txt-to-img-sampler")
        .addEventListener('input',this.handleTextChange);

    this.getVisualProperties("txt-to-img-cfg")
        .addEventListener('input',this.handleInputChange);

    this.getVisualProperties("txt-to-img-seed")
        .addEventListener('input',this.handleInputChange);

    this.getVisualProperties("txt-to-img-step")
        .addEventListener('input',this.handleInputChange);

    this.getVisualProperties("txt-to-img-strength")
        .addEventListener('input',this.handleInputChange);

    return super.setExecVisualizations();
  }

  removeExecVisualizations() {
    this.setField(this.getVisualProperties("txt-to-img-style"), "disabled", "true")
    this.setField(this.getVisualProperties("txt-to-img-engine"), "disabled", "true")
    this.setField(this.getVisualProperties("txt-to-img-clip"), "disabled", "true")
    this.setField(this.getVisualProperties("txt-to-img-sampler"), "disabled", "true")
    this.setField(this.getVisualProperties("txt-to-img-cfg"), "disabled", "true")
    this.setField(this.getVisualProperties("txt-to-img-seed"), "disabled", "true")
    this.setField(this.getVisualProperties("txt-to-img-step"), "disabled", "true")
    this.setField(this.getVisualProperties("txt-to-img-strength"), "disabled", "true");

    this.getVisualProperties("txt-to-img-style")
        .removeEventListener('input',this.handleInputChange);

    this.getVisualProperties("txt-to-img-engine")
        .removeEventListener('input',this.handleInputChange);

    this.getVisualProperties("txt-to-img-clip")
        .removeEventListener('input',this.handleInputChange);

    this.getVisualProperties("txt-to-img-sampler")
        .removeEventListener('input',this.handleInputChange);

    this.getVisualProperties("txt-to-img-cfg")
        .removeEventListener('input',this.handleInputChange);

    this.getVisualProperties("txt-to-img-seed")
        .removeEventListener('input',this.handleInputChange);

    this.getVisualProperties("txt-to-img-step")
        .removeEventListener('input',this.handleInputChange);

    this.getVisualProperties("txt-to-img-strength")
        .removeEventListener('input',this.handleInputChange);

    return super.setExecVisualizations();
  }

  async getOutputObject(inputObject) {
    inputObject = await super.getOutputObject(inputObject)

    console.log(inputObject)

    let prompts = inputObject["input_1"]
    const imgObject = inputObject["input_2"]
    if (imgObject["type"] !== "image"){
      throw TypeCastingError("Image file", imgObject["type"])
    }

    if(!Array.isArray(prompts)){
      prompts = [prompts]
    }

    console.log()

    const requestBody = {
      "engine_id": this.getVisualProperties("txt-to-img-engine").value,
      "text_prompts": prompts,
      "cfg_scale": parseInt(this.getVisualProperties("txt-to-img-cfg").value),
      "clip_guidance_preset": this.getVisualProperties("txt-to-img-clip").value,
      "sampler": this.getVisualProperties("txt-to-img-sampler").value,
      "seed": parseInt(this.getVisualProperties("txt-to-img-seed").value),
      "steps": parseInt(this.getVisualProperties("txt-to-img-step").value),
      "style_preset": this.getVisualProperties("txt-to-img-style").value,
      "init_image": imgObject["file_id"],
      "init_image_mode": "IMAGE_STRENGTH",
      "image_strength": parseFloat(this.getVisualProperties("txt-to-img-strength").value)
    }

    const response = await imageToImage(requestBody)

    let fileId = response["url"].split("?X-Amz-Algorithm")[0]

    fileId = fileId.split("amazonaws.com/")[1]

    return {"output_1": {
      "file_id": fileId,
      "file": "",
      "url": response["url"],
      "type": "image"
    }
  }}

}

