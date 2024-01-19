import {evaluatePython} from "./pyodide.js";
import {
  imageToImage,
  imageUpscaler,
  textToImage,
  imageToImageMask,
  requestInterceptor,
  uploadImage,
  dalleTextToImage
} from "./api.js";

class TypeCastingError extends Error {
  constructor(expectedType, receivedValue) {
    super(`Expected ${expectedType}, but received ${typeof receivedValue}`);
  }
}

export function getOperator(nodeId, editor) {
  const idNode = "node-{id}".replace("{id}", nodeId)
  const op = new operatorHandler(editor, idNode);

  switch (op.name) {
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
    case 'imageUpscaler':
      return new ImageUpscalerHandler(editor, idNode)
    case 'imageToImageMasking':
      return new ImageToImageMaskHandler(editor, idNode)
    case 'dalleTextToImage':
      return new DallETextToImageHandler(editor, idNode)
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

  _resetField(cls) {
    const inputFields = this._operatorDoc.getElementsByClassName(`insert-field-${cls}`)
    for (let i = 0; i < inputFields.length; i++) {
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
          this.deleteField(inputFields.item(i), "disabled")
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


export class PythonHandler extends operatorHandler {
  constructor(editor, nodeId) {
    super(editor, nodeId);
  }

  async getOutputObject(inputObject) {
    // inputObject = await super.getOutputObject(inputObject)
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
    name.textContent = this.getInputValue(0, "static")

    this.setField(name, "textContent", this.getInputValue(0, "static"))
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
    // this.deleteField(imageButton,"disabled")
    imageButton.addEventListener('change', this.changeInput);
    return super.setExecVisualizations();
  }

  removeExecVisualizations() {
    const imageButton = this.getVisualProperties("image-input")
    // this.setField(imageButton,"disabled", "true")
    imageButton.removeEventListener('change', this.changeInput)
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
    this.setField(output,"textContent", jOut)
  }

  updateVisualizations() {
    try {
      let jName = this.getVisualProperties("json-operator-name")
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

  updateVisualizations() {
    let name = this.getInputValue(0, "static");
    this.setField(this.getVisualProperties("ipo-name"), "textContent", name)
    return super.updateVisualizations();
  }

  changeWeightSlider(event) {
    if (event.target && event.target.classList.contains('ipo-weight')) {
      const outputElement = event.target.parentElement.querySelector('.ipo-weight-display');
      const negativeCheckbox = event.target.parentElement.querySelector('.ipo-negative');
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

  checkPrompt(event) {
    const inputValue = event.target.value;
    event.target.setAttribute("value", inputValue)
    event.target["value"] = inputValue
    event.target.setAttribute("textContent", inputValue)
    event.target["textContent"] = inputValue
  }

  changeSign() {
    const weightSlider = this.getVisualProperties("ipo-weight");
    const outputElement = weightSlider.parentElement.querySelector('.ipo-weight-display');
    const isNegative = this.getVisualProperties("ipo-negative").checked;

    if (isNegative){
      this.setField(this.getVisualProperties("ipo-negative"), "checked", isNegative)
    }else{
      this.deleteField(this.getVisualProperties("ipo-negative"), "checked")
    }
    let weight = parseFloat(weightSlider.value);

    if (isNegative) {
      weight *= -1;
    }

    this.setField(outputElement, "textContent", weight)
  }

  setExecVisualizations() {

    const negativeCheckbox = this.getVisualProperties("ipo-negative");
    const prompt = this.getVisualProperties("ipo-prompt");
    const weight = this.getVisualProperties("ipo-weight");

    weight.addEventListener('input', this.changeWeightSlider);
    prompt.addEventListener('input', this.checkPrompt);
    negativeCheckbox.addEventListener('change', () => this.changeSign());

    return super.setExecVisualizations();
  }

  removeExecVisualizations() {

    const negativeCheckbox = this.getVisualProperties("ipo-negative");
    const prompt = this.getVisualProperties("ipo-prompt");
    const weight = this.getVisualProperties("ipo-weight");

    weight.removeEventListener('input', this.changeWeightSlider);
    prompt.removeEventListener('input', this.checkPrompt);
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
    name.textContent = this.getInputValue(0, "static");
    this.setField(name, "textContent", this.getInputValue(0, "static"))

    return super.updateVisualizations();
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

      // Check if the prompt exists
      if (prompt) {

        combinedPrompts.push({
          "weight": prompt.weight,
          "text": prompt.text,
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
  }

  updateHeightAndWidth(event) {

    const outerParent = event.target.parentElement.parentElement.parentElement

    const engineSelect = event.target.parentElement.querySelector('.txt-to-img-engine');
    const heightInput = outerParent.querySelector('.txt-to-img-height');
    const widthInput = outerParent.querySelector('.txt-to-img-width');


    const engineValue = engineSelect.value;

    switch (engineValue) {
      case "SDXL_Beta":
        heightInput.value = 512;
        widthInput.value = 896;
        break;
      case "SDXL_v0.9":
        heightInput.value = 832;
        widthInput.value = 1216;
        break;
      case "SDXL_v1.0":
        heightInput.value = 832;
        widthInput.value = 1216;
        break;
      case "SD_v1.6":
        heightInput.value = 832;
        widthInput.value = 1216;
        break;
      case "SD_v2.1":
        heightInput.value = 832;
        widthInput.value = 1216;
        break;
      default:
        heightInput.value = 512;
        widthInput.value = 512;
    }
    heightInput.setAttribute("value", heightInput.value)
    widthInput.setAttribute("value", widthInput.value)
  }

  updateCfg(event) {
    if (event.target && event.target.classList.contains('txt-to-img-cfg')) {
      const cfg = event.target;

      cfg.addEventListener('blur', function() {
        let cfgValue = parseFloat(cfg.value);

        if (!isNaN(cfgValue) && cfgValue >= 0 && cfgValue <= 35) {
          cfg.value = cfgValue;
          cfg.setAttribute("value", cfgValue)
        } else {
          cfg.value = '7';
          cfg.setAttribute("value", "7")
        }
      });
    }
  }

  updateSeed(event) {
    if (event.target && event.target.classList.contains('txt-to-img-seed')) {
      const seed = event.target;

      seed.addEventListener('blur', function() {
        let seedValue = parseFloat(seed.value);

        if (!isNaN(seedValue) && seedValue >= 0 && seedValue <= 4294967295) {
          seed.value = seedValue;
          seed.setAttribute("value", seedValue)
        } else {
          seed.value = '0';
          seed.setAttribute("value", "0")
        }
      });
    }
  }

  updateStep(event) {
    if (event.target && event.target.classList.contains('txt-to-img-step')) {
      const step = event.target;

      step.addEventListener('blur', function() {
        let stepValue = parseFloat(step.value);

        if (!isNaN(stepValue) && stepValue >= 10 && stepValue <= 50) {
          step.value = stepValue;
          step.setAttribute("value", stepValue)
        } else {
          step.value = '30';
          step.setAttribute("value", "30")
        }
      });
    }
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

  updateVisualizations() {
    let name = this.getVisualProperties("txt-to-img-name");
    this.setField(name, "textContent", this.getInputValue(0, "static"))

    try {

      return super.updateVisualizations();

    } catch (error) {
      return false
    }
  }

  setExecVisualizations() {
    const styleSelect = this.getVisualProperties("txt-to-img-style")
    this.deleteField(styleSelect, "disabled")
    styleSelect.addEventListener("input", this.handleTextChange)

    const engine = this.getVisualProperties("txt-to-img-engine")
    this.deleteField(engine, "disabled")
    engine.addEventListener("change", this.updateHeightAndWidth);
    engine.addEventListener("input", this.handleTextChange)

    const clip = this.getVisualProperties("txt-to-img-clip")
    this.deleteField(clip, "disabled")
    clip.addEventListener("input", this.handleTextChange)

    const sampler = this.getVisualProperties("txt-to-img-sampler")
    this.deleteField(sampler, "disabled")
    sampler.addEventListener("input", this.handleTextChange)

    const cfg = this.getVisualProperties("txt-to-img-cfg")
    this.deleteField(cfg, "disabled")
    cfg.addEventListener('input', this.updateCfg);

    const seed = this.getVisualProperties("txt-to-img-seed")
    this.deleteField(seed, "disabled")
    seed.addEventListener('input', this.updateSeed);

    const step = this.getVisualProperties("txt-to-img-step")
    this.deleteField(step, "disabled")
    step.addEventListener('input', this.updateStep);

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

    const styleSelect = this.getVisualProperties("txt-to-img-style")
    styleSelect.removeEventListener("input", this.handleTextChange)

    const engine = this.getVisualProperties("txt-to-img-engine")
    engine.removeEventListener("change", this.updateHeightAndWidth);
    engine.removeEventListener("input", this.handleTextChange)

    const clip = this.getVisualProperties("txt-to-img-clip")
    clip.removeEventListener("input", this.handleTextChange)

    const sampler = this.getVisualProperties("txt-to-img-sampler")
    sampler.removeEventListener("input", this.handleTextChange)

    const cfg = this.getVisualProperties("txt-to-img-cfg")
    cfg.removeEventListener('input', this.updateCfg);

    const seed = this.getVisualProperties("txt-to-img-seed")
    seed.removeEventListener('input', this.updateSeed);

    const step = this.getVisualProperties("txt-to-img-step")
    step.removeEventListener('input', this.updateStep);

    return super.setExecVisualizations();
  }


  async getOutputObject(inputObject) {

    const height = parseFloat(this.getVisualProperties("txt-to-img-height").value);
    const width = parseFloat(this.getVisualProperties("txt-to-img-width").value);
    const cfgScale = parseFloat(this.getVisualProperties("txt-to-img-cfg").value);
    const seed = parseFloat(this.getVisualProperties("txt-to-img-seed").value);
    const step = parseFloat(this.getVisualProperties("txt-to-img-step").value);

    let textPrompts = inputObject["input_1"]

    if (textPrompts) {
      if (Array.isArray(textPrompts)) {
      } else if (typeof textPrompts === "object") {
        textPrompts = [textPrompts];
      } else {
        textPrompts = [];
      }
    } else {
      textPrompts = [];
    }

    const requestBody = {
      "height": height,
      "width" : width,
      "text_prompts": textPrompts,
      "style_preset": this.getVisualProperties("txt-to-img-style").value,
      "engine_id": this.getVisualProperties("txt-to-img-engine").value,
      "clip_guidance_preset": this.getVisualProperties("txt-to-img-clip").value,
      "sampler": this.getVisualProperties("txt-to-img-sampler").value,
      "cfg_scale": cfgScale,
      "seed": seed,
      "steps": step,
    };


    let apiResponse;

    try {
      apiResponse = await requestInterceptor(textToImage, requestBody);
    } catch(error) {
      console.log(error);
    }


    let fileId = apiResponse["url"].split("?X-Amz-Algorithm")[0]

    fileId = fileId.split("amazonaws.com/")[1]

    return {
      "output_1": {
        "file_id": fileId,
        "file": "",
        "url": apiResponse["url"],
        "type": "image"
      }
    };

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
      this.getVisualProperties("download-Button").removeEventListener('click', this.downloadImage);
    }

    return super.removeExecVisualizations();
  }


  downloadImage(event) {


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
    // inputObject = await super.getOutputObject(inputObject)

    console.log(inputObject)

    let prompts = inputObject["input_1"]
    const imgObject = inputObject["input_2"]
    if (imgObject["type"] !== "image"){
      throw TypeCastingError("Image file", imgObject["type"])
    }

    if(!Array.isArray(prompts)){
      prompts = [prompts]
    }

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

    const response = await requestInterceptor(imageToImage,requestBody)

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

export class ImageUpscalerHandler extends operatorHandler {

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
      this.getVisualProperties("download-Button").removeEventListener('click', this.downloadImage);
    }

    return super.removeExecVisualizations();
  }

  downloadImage(event) {


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
    const data = inputObject["input_1"];

    // Extract file_id from the input file object
    const fileId = data["file_id"];

    // Create the request body for the API call
    const requestBody = {
      "width": 2048,
      "image": fileId,
      "engine_id": "ESRGAN_V1X2",
    };

    let apiResponse;

    try {
      // Make the API request
      apiResponse = await requestInterceptor(imageUpscaler, requestBody);
    } catch(error) {
      console.log(error);
      throw new Error("API request failed");
    }


    const imageElement = this.getVisualProperties("image-op-file");
    imageElement.src = apiResponse["url"];

    return {}
  }
}

export class ImageToImageMaskHandler extends operatorHandler {

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
    this.deleteField(this.getVisualProperties("txt-to-img-mask-source"), "disabled");

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

    this.getVisualProperties("txt-to-img-mask-source")
        .addEventListener('input',this.handleTextChange);

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
    this.setField(this.getVisualProperties("txt-to-img-mask-source"), "disabled", "true");

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

    this.getVisualProperties("txt-to-img-mask-source")
        .removeEventListener('input',this.handleTextChange);

    return super.setExecVisualizations();
  }

  async getOutputObject(inputObject) {
    inputObject = await super.getOutputObject(inputObject)

    let prompts = inputObject["input_1"]
    const imgObject = inputObject["input_2"]
    const maskObject = inputObject["input_2"]
    if (imgObject["type"] !== "image"){
      throw TypeCastingError("Image file", imgObject["type"])
    }

    if (maskObject["type"] !== "image"){
      throw TypeCastingError("Image file", imgObject["type"])
    }

    if(!Array.isArray(prompts)){
      prompts = [prompts]
    }

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
      "mask_image": maskObject["file_id"],
      "mask_source": this.getVisualProperties("txt-to-img-mask-source").value
    }


    const response = await requestInterceptor(imageToImageMask,requestBody)

    let fileId = response["url"].split("?X-Amz-Algorithm")[0]

    fileId = fileId.split("amazonaws.com/")[1]

    return {"output_1": {
        "file_id": fileId,
        "file": "",
        "url": response["url"],
        "type": "image"
      }
    }
  }
}

export class DallETextToImageHandler extends operatorHandler {
  constructor(editor, nodeId) {
    super(editor, nodeId);
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

  checkPrompt(event) {
    const inputValue = event.target.value;
    event.target.setAttribute("value", inputValue)
    event.target["value"] = inputValue
    event.target.setAttribute("textContent", inputValue)
    event.target["textContent"] = inputValue
  }

  updateVisualizations() {
    let name = this.getVisualProperties("dalle-txt-to-img-name");
    this.setField(name, "textContent", this.getInputValue(0, "static"))

    try {

      return super.updateVisualizations();

    } catch (error) {
      return false
    }
  }

  setExecVisualizations() {
    const styleSelect = this.getVisualProperties("dalle-txt-to-img-style")
    this.deleteField(styleSelect, "disabled")
    styleSelect.addEventListener("input", this.handleTextChange)

    const resolution = this.getVisualProperties("dalle-txt-to-img-resolution")
    this.deleteField(resolution, "disabled")
    resolution.addEventListener("input", this.handleTextChange)

    const quality = this.getVisualProperties("dalle-txt-to-img-quality")
    this.deleteField(resolution, "disabled")
    quality.addEventListener("input", this.handleTextChange)

    const prompt = this.getVisualProperties("dalle-txt-to-img-prompt");
    prompt.addEventListener('input', this.checkPrompt);

    return super.setExecVisualizations();
  }

  removeExecVisualizations() {
    this.setField(this.getVisualProperties("dalle-txt-to-img-style"), "disabled", "true")
    this.setField(this.getVisualProperties("dalle-txt-to-img-resolution"), "disabled", "true")
    this.setField(this.getVisualProperties("dalle-txt-to-img-quality"), "disabled", "true")

    const styleSelect = this.getVisualProperties("dalle-txt-to-img-style")
    styleSelect.removeEventListener("input", this.handleTextChange)

    const resolution = this.getVisualProperties("dalle-txt-to-img-resolution")
    resolution.removeEventListener("input", this.handleTextChange)

    const quality = this.getVisualProperties("dalle-txt-to-img-resolution")
    quality.removeEventListener("input", this.handleTextChange)

    const prompt = this.getVisualProperties("dalle-txt-to-img-prompt");
    prompt.removeEventListener('input', this.checkPrompt);

    return super.setExecVisualizations();
  }


  async getOutputObject(inputObject) {
    const quality = this.getVisualProperties("dalle-txt-to-img-quality").value;
    const style = this.getVisualProperties("dalle-txt-to-img-style").value;
    const resolution = this.getVisualProperties("dalle-txt-to-img-resolution").value;
    const prompt = this.getVisualProperties("dalle-txt-to-img-prompt").value;

    const requestBody = {
      "quality": quality,
      "size" : resolution,
      "style": style,
      "prompt": prompt
    };

    let apiResponse;

    try {
      apiResponse = await requestInterceptor(dalleTextToImage, requestBody);
    } catch(error) {
      console.log(error);
    }


    let fileId = apiResponse["url"].split("?X-Amz-Algorithm")[0]

    fileId = fileId.split("amazonaws.com/")[1]

    return {
      "output_1": {
        "file_id": fileId,
        "file": "",
        "url": apiResponse["url"],
        "type": "image"
      }
    };

  }
}

