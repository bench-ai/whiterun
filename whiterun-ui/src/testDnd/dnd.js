import React, {useEffect} from 'react';
import mixpanel from "mixpanel-browser";

const DragAndDrop = () => {

    function parseUrl(){
        const queryString = window.location.search;
        const queryParams = new URLSearchParams(queryString);
        return queryParams.get('id')
    }

    useEffect(() => {
        const loadScripts = async () => {
            // Loading all scripts
            const pyodideScript = document.createElement('script');
            pyodideScript.src = 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js';
            pyodideScript.async = true;

            const pyodideScriptLoaded = new Promise(resolve => {
                pyodideScript.onload = resolve;
            });

            document.head.appendChild(pyodideScript);

            await pyodideScriptLoaded;

            const drawflowScript = document.createElement('script');
            drawflowScript.src = 'https://cdn.jsdelivr.net/gh/jerosoler/Drawflow/dist/drawflow.min.js';
            drawflowScript.async = true;

            const drawflowScriptLoaded = new Promise(resolve => {
                drawflowScript.onload = resolve;
            });

            document.head.appendChild(drawflowScript);

            await drawflowScriptLoaded;

            const fontAwesomeScript = document.createElement('script');
            fontAwesomeScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.13.0/js/all.min.js';
            fontAwesomeScript.async = true;

            const fontAwesomeScriptLoaded = new Promise(resolve => {
                fontAwesomeScript.onload = resolve;
            });

            document.head.appendChild(fontAwesomeScript);

            await fontAwesomeScriptLoaded;

            const sweetalertScript = document.createElement('script');
            sweetalertScript.src = 'https://cdn.jsdelivr.net/npm/sweetalert2@9';
            sweetalertScript.async = true;

            const sweetalertScriptLoaded = new Promise(resolve => {
                sweetalertScript.onload = resolve;
            });

            document.head.appendChild(sweetalertScript);

            const micromodalScript = document.createElement('script');
            micromodalScript.src = 'https://unpkg.com/micromodal/dist/micromodal.min.js';
            micromodalScript.async = true;

            const micromodalScriptLoaded = new Promise(resolve => {
                micromodalScript.onload = resolve;
            });

            document.head.appendChild(micromodalScript);

            await Promise.all([sweetalertScriptLoaded, micromodalScriptLoaded]);

            const baseScript = document.createElement('script');
            baseScript.src = './js/base.js'; // Adjust the path to your base.js file
            baseScript.type = 'module';
            baseScript.async = true;

            const baseScriptLoaded = new Promise(resolve => {
                baseScript.onload = resolve;
            });

            document.head.appendChild(baseScript);

            await baseScriptLoaded;

        };

        loadScripts();
    }, []);

    window.handlePlayButtonClick = () => {
        mixpanel.track('Workflow Play Button Clicked', {'Workflow Name': parseUrl()});
    };

    return (
        <div dangerouslySetInnerHTML={{
            __html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>Bench AI | Workbench
  </title>
  <meta name="description"
        content="Simple library for flow programming. Drawflow allows you to create data flows easily and quickly.">
</head>
<body>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/jerosoler/Drawflow@0.0.48/dist/drawflow.min.css">
<link href='https://fonts.googleapis.com/css?family=Inter' rel='stylesheet'>
<link rel="stylesheet" type="text/css" href="dnd.css"/>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.13.0/css/all.min.css"
      integrity="sha256-h20CPZ0QyXlBuAw7A+KluUYx/3pK+c7lYEpqLTlxjYQ=" crossorigin="anonymous"/>
<link href="https://fonts.googleapis.com/css2?family=Roboto&display=swap" rel="stylesheet">

<div class="wrapper">
  <div class="col">

    <div class="drag-drawflow" draggable="true" ondragstart="drag(event)" data-node="image">
      <span class="operator-title">Image Operator</span>
      <i class="icon">
        <img class="logo" src="assets/image-logo.svg" alt="Icon description" draggable="false">
      </i>
    </div>

    <div class="drag-drawflow" draggable="true" ondragstart="drag(event)" data-node="python">
      <span class="operator-title">Python Operator</span>
      <i class="icon">
        <img class="logo" src="assets/python-logo.svg" alt="Icon description" draggable="false">
      </i>
    </div>

    <div class="drag-drawflow" draggable="true" ondragstart="drag(event)" data-node="jsonDisplay">
      <span class="operator-title">Display Operator</span>
      <i class="icon">
        <img class="logo" src="assets/json-logo.svg" alt="Icon description" draggable="false">
      </i>
    </div>
    
    <div class="drag-drawflow" draggable="true" ondragstart="drag(event)" data-node="imageDisplay">
      <span class="operator-title">Image Display Operator</span>
      <i class="icon">
        <img class="logo" src="assets/image-logo.svg" alt="Icon description" draggable="false">
      </i>
    </div>
    
    <div class="drag-drawflow" draggable="true" ondragstart="drag(event)" data-node="weightedPrompt">
      <span class="operator-title">Image Prompt Operator</span>
      <i class="icon">
        <img class="logo" src="assets/image-prompt-logo.svg" alt="Icon description" draggable="false">
      </i>
    </div>
    
    <div class="drag-drawflow" draggable="true" ondragstart="drag(event)" data-node="promptGrouper">
      <span class="operator-title">Prompt Grouper</span>
      <i class="icon">
        <img class="logo" src="assets/prompt-grouper-logo.svg" alt="Icon description" draggable="false">
      </i>
    </div>
    
    <div class="drag-drawflow" draggable="true" ondragstart="drag(event)" data-node="textToImage">
      <span class="operator-title">Text to Image Operator</span>
      <i class="icon">
        <img class="logo" src="assets/palette-logo.svg" alt="Icon description" draggable="false">
      </i>
    </div>
    
    <div class="drag-drawflow" draggable="true" ondragstart="drag(event)" data-node="imageToImage">
      <span class="operator-title">Image to Image Operator</span>
      <i class="icon">
        <img class="logo" src="assets/palette-logo.svg" alt="Icon description" draggable="false">
      </i>
    </div>
    
    <div class="drag-drawflow" draggable="true" ondragstart="drag(event)" data-node="imageUpscaler">
      <span class="operator-title">Image Upscaler</span>
      <i class="icon">
        <img class="logo" src="assets/upscale-logo.svg" alt="Icon description" draggable="false">
      </i>
    </div>
    
    <div class="drag-drawflow" draggable="true" ondragstart="drag(event)" data-node="imageToImageMasking">
      <span class="operator-title">Mask Image to Image Operator</span>
      <i class="icon">
        <img class="logo" src="assets/palette-logo.svg" alt="Icon description" draggable="false">
      </i>
    </div>
    
    <div class="drag-drawflow" draggable="true" ondragstart="drag(event)" data-node="upscaleTile">
      <span class="operator-title">Controlnet tile Upscaler</span>
      <i class="icon">
        <img class="logo" src="assets/upscale-tile-logo.svg" alt="Icon description" draggable="false">
      </i>
    </div>
    

  </div>

  <div class="col-right">

    <div id="drawflow" ondrop="drop(event)" ondragover="allowDrop(event)">

      <div class="btn-lock">
   
        <button class="play-button" id="disabled-play-button">
          <img src="assets/play-button-disabled-logo.svg" alt="Play Button" style="display:none;">
        </button>
        
        <button class="play-button" id="enabled-play-button" onclick="handlePlayButtonClick()">
            <img src="assets/play-button-logo.svg" alt="Play Button" onclick="executeGraph()">
        </button>
        
        <button class="save-button">
          <img src="assets/save-logo.svg" alt="Save Button" onclick="saveDrawFlow()">
        </button>
      </div>
    </div>
  </div>

</div>

<div id="popupContainer">

  <button id="closePyForm">
    <img class="close-button" src="assets/close-logo.svg" alt="Icon description" draggable="false">
  </button>

  <div class="underline-header" id="popupPyMainTitle"> Python Operator Settings</div>
  <div class="underline-header"> Python File</div>

  <div class="file-div">
    <input type="file" id="pythonFile" name="pythonFile" accept=".py">
  </div>

  <div class="underline-header"> Input(s)</div>

  <div class="type-table">
    <div class="table-buttons">
      <button type="button" onclick="pythonInputTable.addRow()">Add Row</button>
      <button type="button" onclick="pythonInputTable.addCol()">Add Column</button>
      <button type="button" onclick="pythonInputTable.removeRow()">Remove Row</button>
      <button type="button" onclick="pythonInputTable.removeCol()">Remove Column</button>
    </div>

    <form id="inputTableForm" class="python-form">
      <table>
        <thead>
        <tr class="column-names">
          <th>Name</th>
          <th>Type</th>
        </tr>
        </thead>
        <tbody>
        <!-- Table rows will be added dynamically -->
        </tbody>
      </table>
    </form>
  </div>

  <div class="underline-header"> Output(s)</div>

  <div class="type-table">
    <div class="table-buttons">
      <button type="button" onclick="pythonOutputTable.addRow()">Add Row</button>
      <button type="button" onclick="pythonOutputTable.addCol()">Add Column</button>
      <button type="button" onclick="pythonOutputTable.removeRow()">Remove Row</button>
      <button type="button" onclick="pythonOutputTable.removeCol()">Remove Column</button>
    </div>

    <form id="outputTableForm" class="python-form">
      <table>
        <thead>
        <tr>
          <th>Type</th>
        </tr>
        </thead>
        <tbody>
        <!-- Table rows will be added dynamically -->
        </tbody>
      </table>
    </form>

  </div>

  <button class="submit-button" id="submitBtnPyForm"> submit </button>
</div>

<div id="overlay"></div>


</body>
</html>

`
        }}/>
    );
};

export default DragAndDrop;