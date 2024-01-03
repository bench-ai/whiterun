import {getOperator} from "./operatorHandlers.js";
import {PythonTable} from "./pythonTable.js";
import {collectOperatorMetaData, fetchHTML, mapToDiv} from "./constuctOperator.js"
import {Drawflowoverride} from "./drawflowOverride.js";
import {ExecutionGraph} from "./checkGraph.js"

let pythonOutputTable;
let pythonInputTable;
let selectedNode;
let mode = "editor";
let connectionRemovalReason = "";
var id = document.getElementById("drawflow");
const editor = new Drawflowoverride(id);
editor.reroute = true;
editor.start();

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

editor.on("connectionCreated", function (dataDict) {
  if (mode !== "editor"){
    connectionRemovalReason = "rejectedOnCreation";
    editor.removeSingleConnection(dataDict["output_id"],
      dataDict["input_id"],
      dataDict["output_class"],
      dataDict["input_class"]);
    throw new Error("Connection Error")
  }

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

  if (success) {
    inputNode.saveNodeData(editor)
  } else {
    connectionRemovalReason = "rejectedOnCreation";
    editor.removeSingleConnection(dataDict["output_id"],
      dataDict["input_id"],
      dataDict["output_class"],
      dataDict["input_class"]);

    throw new Error("Connection error")
  }
});

function waitForKeyPress() {
  return new Promise(resolve => {
    function handleKeyPress(event) {
      if (event.key === "Enter") {
        document.removeEventListener('keydown', handleKeyPress);
        document.getElementById("overlay").style.display = "none"
        let popup = document.getElementsByClassName("conn-removed-pu")

        popup = popup[0];
        const modalValue = popup.getElementsByClassName("insert-field-dynamic")[0].value
        popup.style.display = "none"
        resolve(modalValue);
      }
    }

    document.addEventListener('keydown', handleKeyPress);
  });
}


async function displayInputPopup() {

  const modal = document.createElement("div");
  modal.classList.add("conn-removed-pu");

  modal.innerHTML = `
        Enter Replacement Value
        <input class="insert-field-dynamic" type="text" name="" value="Type here...">
  `;

  modal.style.left = `${mousePosition.x}px`;
  modal.style.top = `${mousePosition.y}px`;

  document.body.appendChild(modal);

  document.getElementById("overlay").style.display = "block"
  modal.style.display = "block"

  const keyPressValue = await waitForKeyPress()
  modal.remove()
  return keyPressValue
}


editor.on("connectionRemoved", async function (dataDict) {
  console.log("now I am here");
  if (connectionRemovalReason === ""){
    const value = await displayInputPopup()
    let inputNode = getOperator(dataDict["input_id"], editor);
    if (!inputNode.disconnectOperator(dataDict["input_class"], value, editor)) {
      editor.addConnection(dataDict["output_id"], dataDict["input_id"], dataDict["output_class"], dataDict["input_class"])
    }
  }else{
    connectionRemovalReason = "";
  }
});

editor.on("connectionBeforeRemoved", ({output_id, input_id, output_class, input_class}) => {
  return mode === "editor";
})

editor.on('nodeUnselected', function (update) {

  if(mode === "editor"){
    if (update) {
      const node = getOperator(selectedNode, editor)
      const update = node.updateVisualizations()

      if (update) {
        node.saveNodeData(editor)
      } else {
        node.resetInputFields()
      }
    }
  }
})

editor.on('nodeSelected', function (id) {
  selectedNode = id
})

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

  return [name, inputs, outputs, visualization, "Python Operator", "assets/python-logo.svg"]
}


async function addNodeToDrawFlow(name, pos_x, pos_y) {
  if (editor.editor_mode === 'fixed') {
    return false;
  }

  if (mode === 'execute') {
    return false;
  }

  let inputs;
  let outputs;
  let visualization;
  let logo;
  let title;

  if (name === "python") {

    const valueArr = await processPythonForm();
    inputs = {"dynamic": valueArr[1], "static": []};
    outputs = valueArr[2];
    visualization = valueArr[3];
    title = valueArr[4];
    logo = valueArr[5];
    name = valueArr[0];
  } else {
    try {
      const dataList = await collectOperatorMetaData(name);
      inputs = dataList[1];
      outputs = dataList[2];
      visualization = dataList[0];
      title = dataList[3];
      logo = dataList[4];
    } catch (error) {
      name = "none";
    }
  }

  pos_x = pos_x * (editor.precanvas.clientWidth / (editor.precanvas.clientWidth * editor.zoom)) - (editor.precanvas.getBoundingClientRect().x * (editor.precanvas.clientWidth / (editor.precanvas.clientWidth * editor.zoom)));
  pos_y = pos_y * (editor.precanvas.clientHeight / (editor.precanvas.clientHeight * editor.zoom)) - (editor.precanvas.getBoundingClientRect().y * (editor.precanvas.clientHeight / (editor.precanvas.clientHeight * editor.zoom)))

  if (name !== "none") {
    let nodeDiv = mapToDiv(inputs, outputs, title, logo);
    nodeDiv = nodeDiv.replace("{viz}", visualization)
    const nodeMap = {"inputs": inputs, "outputs": outputs}
    editor.addNode(name, inputs["dynamic"].length, outputs.length, pos_x, pos_y, name, nodeMap, nodeDiv);
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

function changeMode(option) {
  const lock = document.getElementById(`lock`)
  const unlock = document.getElementById(`unlock`)
  const drawflowContainer = document.getElementById('drawflow');
  const playButton = document.getElementById('enabled-play-button');
  let xport = editor.export()["drawflow"]["Home"]["data"];
  let xportKeys = Object.keys(xport);

  // let e = new ExecutionGraph(xport)
  // e.getGraphExecutionOrder(editor)

  if (option === 'unlock') {
    mode = "editor"
    lock.style.display = 'none';
    unlock.style.display = 'block';
    playButton.style.display = 'none'

    drawflowContainer.style.backgroundImage = `
      radial-gradient(circle, #696B6F 4px, transparent 4px),
      radial-gradient(circle, #606060 0px, transparent 0px)
    `;

    xportKeys.forEach((element) => {
      const op = getOperator(element, editor);
      op.unlockInputFields()
      op.removeExecVisualizations();
    })

  } else {
    mode = "execute"
    lock.style.display = 'block';
    unlock.style.display = 'none';
    playButton.style.display = 'block'

    drawflowContainer.style.backgroundImage = 'none';

    xportKeys.forEach((element) => {
      const op = getOperator(element, editor);
      op.lockInputFields();
      op.setExecVisualizations();
    })
  }
}

window.changeMode = changeMode;
