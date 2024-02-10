import {getOperator, getSaveViz} from "./operatorHandlers.js";
import {PythonTable} from "./pythonTable.js";
import {collectOperatorMetaData, fetchHTML, mapToDiv} from "./constuctOperator.js"
import {Drawflowoverride} from "./drawflowOverride.js";
import {ExecutionGraph} from "./checkGraph.js"
import {getUser, getWorkflow, requestInterceptor, saveWorkflow} from "./api.js";

function parseUrl(){
  const queryString = window.location.search;
  const queryParams = new URLSearchParams(queryString);
  return queryParams.get('id')
}


async function userLoader(){
  try{
    const save = document.getElementsByClassName(`save-button`)[0]
    const userObject = await requestInterceptor(getUser,{}, false)

    if (userObject["work_flows"].hasOwnProperty(parseUrl())){
      save.style.display = "block"
      return [userObject, true]
    }

    return [userObject, false]
  }catch (error){
    return [{}, false]
  }
}

async function workflowLoader(){
  const queryId = parseUrl()
  try{
    return await requestInterceptor(getWorkflow, queryId, false)
  }catch (error){
    return undefined
  }
}

let userPromise = userLoader()
let workflowPromise = workflowLoader()

let pythonOutputTable;
let pythonInputTable;


let connectionRemovalReason = "";
var id = document.getElementById("drawflow");
const editor = new Drawflowoverride(id);
editor.reroute = true;
editor.start();


async function saveDrawFlow(){
  const exported_data = editor.export()

  Object.keys(exported_data["drawflow"]["Home"]["data"]).forEach(k =>{
    const currentNode = exported_data["drawflow"]["Home"]["data"][k]
    currentNode["html"] = ""
  })

  const body = {
    "structure": exported_data,
    "id": parseUrl()
  }

  await requestInterceptor(saveWorkflow, body, true)
}

window.saveDrawFlow = saveDrawFlow;


function loadNode(dataDict, currentNodeOutputs, operator){
  Object.keys(currentNodeOutputs).forEach((element) => {
    const match = element.match(/\d+/);
    const number = parseInt(match[0], 10) - 1

    if (currentNodeOutputs[element]["connections"].length > 0){
      const supplier = currentNodeOutputs[element]["connections"][0]["node"]
      operator.setSupplier(number, dataDict[supplier]["class"])
    }
  })
}

async function loadEditor(){
  const workflow = await workflowPromise

  if (workflow === undefined){
    window.location.replace("https://app.bench-ai.com/error");
  }

  const operatorDict = {}

  if (workflow["structure"] !== null){

    const keyList = Object.keys(workflow["structure"]["drawflow"]["Home"]["data"])

    for (let i = 0; i < keyList.length; i++){
      const currentNode = workflow["structure"]["drawflow"]["Home"]["data"][keyList[i]]
      const dataList = await collectOperatorMetaData(currentNode["class"]);

      operatorDict[currentNode["id"]] = {
        "class": currentNode["class"],
        "inputs": currentNode["inputs"],
        "outputs": currentNode["outputs"],
      }

      let inputs = dataList[1];
      let outputs = dataList[2];
      const title = dataList[3];
      const logo = dataList[4];
      const tooltip = dataList[5];

      if (currentNode["class"] === "python"){
        inputs = currentNode["data"]["inputs"];
        outputs = currentNode["data"]["outputs"];
      }

      let nodeDiv = mapToDiv(inputs, outputs, title, logo, tooltip);
      nodeDiv = nodeDiv.replace("{viz}", await getSaveViz(
          currentNode["class"],
          currentNode["data"]["data"]))

      currentNode["html"] = nodeDiv
      editor.import(workflow["structure"])
    }

    let xport = editor.export()["drawflow"]["Home"]["data"];
    let xportKeys = Object.keys(xport);

    xportKeys.forEach((element) => {
      const op = getOperator(element, editor);
      loadNode(operatorDict, operatorDict[element]["inputs"], op)
      op.setExecVisualizations();
    })
  }
}

loadEditor().then(r => {})


var elements = document.getElementsByClassName('drag-drawflow');
for (var i = 0; i < elements.length; i++) {
  elements[i].addEventListener('touchend', drop, false);
  elements[i].addEventListener('touchmove', positionMobile, false);
  elements[i].addEventListener('touchstart', drag, false);
}

var mobile_item_selec = '';
var mobile_last_move = null;
let mousePosition = null;

editor.on("mouseMove", function (data) {
  mousePosition = data;
})

editor.on("nodeBeforeRemoved", function (nodeId){
  const match = nodeId.match(/\d+/);
  const node_number = parseInt(match[0], 10)
  const op = getOperator(node_number, editor);
  op.removeExecVisualizations()
  console.log("here")
  editor.removeConnectionNodeId(nodeId)
  return true
})

editor.on("connectionCreated", function (dataDict) {

  const g = new ExecutionGraph(editor.export()["drawflow"]["Home"]["data"])

  if (g.isCyclic()){
    connectionRemovalReason = "rejectedOnCreation";
    editor.removeSingleConnection(dataDict["output_id"],
      dataDict["input_id"],
      dataDict["output_class"],
      dataDict["input_class"]);
    throw new Error("Connection error")
  }

  let outputNode = getOperator(dataDict["output_id"], editor);
  let inputNode = getOperator(dataDict["input_id"], editor);
  const success = inputNode.connectOperators(outputNode, dataDict["input_class"], dataDict["output_class"])

  if (!success) {
    connectionRemovalReason = "rejectedOnCreation";
    editor.removeSingleConnection(dataDict["output_id"],
      dataDict["input_id"],
      dataDict["output_class"],
      dataDict["input_class"]);

    throw new Error("Connection error")
  }
});

editor.on("connectionRemoved", async function (dataDict) {
  if (connectionRemovalReason === ""){
    let inputNode = getOperator(dataDict["input_id"], editor);
    inputNode.disconnectOperator(dataDict["input_class"]);
  }else{
    connectionRemovalReason = "";
  }
});


function positionMobile(ev) {
  mobile_last_move = ev;
}

function allowDrop(ev) {
  ev.preventDefault();
}

window.allowDrop = allowDrop;


function drop(ev) {
  if (ev.type === "touchend") {
    var parentdrawflow = document.elementFromPoint(mobile_last_move.touches[0].clientX, mobile_last_move.touches[0].clientY).closest("#drawflow");
    if (parentdrawflow != null) {
      addNodeToDrawFlow(mobile_item_selec, mobile_last_move.touches[0].clientX, mobile_last_move.touches[0].clientY);
    }
    mobile_item_selec = '';
  } else {
    ev.preventDefault();
    var data = ev.dataTransfer.getData("node");
    addNodeToDrawFlow(data, ev.clientX, ev.clientY);
  }
}

window.drop = drop;

function drag(ev) {
  if (ev.type === "touchstart") {
    mobile_item_selec = ev.target.closest(".drag-drawflow").getAttribute('data-node');
  } else {
    ev.dataTransfer.setData("node", ev.target.getAttribute('data-node'));
  }
}

window.drag = drag;


function waitForPythonSubmit() {
  return new Promise(resolve => {
    function onClick(result) {
      resolve(result);
      // Remove the event listeners to avoid memory leaks
      document.getElementById('submitBtnPyForm').removeEventListener('click', onClickSubmit);
      document.getElementById('closePyForm').removeEventListener('click', onClickCancel);
    }

    function onClickSubmit() {
      onClick(true)
    }

    function onClickCancel() {
      onClick(false)
    }

    document.getElementById('submitBtnPyForm').addEventListener('click', onClickSubmit)
    document.getElementById('closePyForm').addEventListener('click', onClickCancel)
  });
}


function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = function (e) {
      resolve(e.target.result);
    };

    reader.onerror = function (e) {
      reject(e.target.error);
    };

    reader.readAsText(file);
  });
}


async function processPythonForm() {
  let inputs;
  let outputs;
  let visualization;
  let name = "python";

  pythonInputTable = new PythonTable('inputTableForm', true)
  pythonOutputTable = new PythonTable('outputTableForm', false)

  window.pythonInputTable = pythonInputTable;
  window.pythonOutputTable = pythonOutputTable;

  document.getElementById("popupContainer").style.display = "block"
  document.getElementById("overlay").style.display = "block"

  let cont = true

  while (cont) {
    const filled = await waitForPythonSubmit()
    const pythonFileInput = document.getElementById('pythonFile');

    if (!filled) {
      name = "none"
      cont = false
    } else if (!pythonFileInput.files.length > 0) {
      console.log("no file provided")
    } else {
      try {
        inputs = pythonInputTable.retrieveParameters()
        outputs = pythonOutputTable.retrieveParameters()

        visualization = await fetchHTML('pythonViz');
        const selectedFile = pythonFileInput.files[0]

        const pythonCode = await readFileAsText(selectedFile);
        visualization = visualization.replace("{text}", pythonCode)
        cont = false

      } catch (error) {
        console.log(error.message)
      }
    }
  }

  document.getElementById("popupContainer").style.display = "none"
  document.getElementById("overlay").style.display = "none"

  return [visualization, inputs, outputs]
}


async function addNodeToDrawFlow(name, pos_x, pos_y) {
  if (editor.editor_mode === 'fixed') {
    return false;
  }

  let inputs;
  let outputs;
  let visualization;
  let logo;
  let title;
  let tooltip;

  try {
    const dataList = await collectOperatorMetaData(name);
    inputs = dataList[1];
    outputs = dataList[2];
    visualization = dataList[0];
    title = dataList[3];
    logo = dataList[4];
    tooltip = dataList[5];
  } catch (error) {
    name = "none";
  }

  if (name === "python") {
    const valueArr = await processPythonForm();
    visualization = valueArr[0]
    inputs = {"dynamic": valueArr[1], "static": []};
    outputs = valueArr[2];
  }

  pos_x = pos_x * (editor.precanvas.clientWidth / (editor.precanvas.clientWidth * editor.zoom)) - (editor.precanvas.getBoundingClientRect().x * (editor.precanvas.clientWidth / (editor.precanvas.clientWidth * editor.zoom)));
  pos_y = pos_y * (editor.precanvas.clientHeight / (editor.precanvas.clientHeight * editor.zoom)) - (editor.precanvas.getBoundingClientRect().y * (editor.precanvas.clientHeight / (editor.precanvas.clientHeight * editor.zoom)))

  if (name !== "none") {
    let nodeDiv = mapToDiv(inputs, outputs, title, logo, tooltip);
    nodeDiv = nodeDiv.replace("{viz}", visualization)
    const nodeMap = {"inputs": inputs, "outputs": outputs, "data":{}}
    editor.addNode(name, inputs["dynamic"].length, outputs.length, pos_x, pos_y, name, nodeMap, nodeDiv);

    let xport = editor.export()["drawflow"]["Home"]["data"];

    const dataArr = []

    Object.keys(xport).forEach( numb => {
      dataArr.push(parseInt(numb))
    })

    const nodeId = Math.max(...dataArr)
    const op = getOperator(nodeId.toString(), editor);
    op.setExecVisualizations()
  }
}

async function executeGraph(){
  const playButton = document.getElementById('enabled-play-button');
  playButton.style.display = "none"

  const grayPlay = document.getElementById('disabled-play-button');
  grayPlay.style.display = "block"

  let xport = editor.export()["drawflow"]["Home"]["data"];
  let e = new ExecutionGraph(xport)

  try{
    await e.getGraphExecutionOrder(editor)
  }catch (error){
    console.log(error)
  }

  grayPlay.style.display = "none"
  playButton.style.display = "block"
}
window.executeGraph = executeGraph;
