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

<div id="editModal" class="modal-wrapper">
  <div class="modal-edit-image">
  <span class="modal-edit-image-close">&times;</span>
  <div class="model-edit-image-title">
    Image Mask Editor
  </div>
    <div class="modal-edit-image-content">
    <div class="modal-editor-column">
        <div class="modal-editor-divider">
            <button id="resetButton" class="modal-editor-button">Reset Edits</button>
        </div>
        <div class="modal-editor-divider">
            <button id="toggleCanvasButton" class="modal-editor-button">Toggle Mask Preview</button>
        </div>
        <div class="modal-editor-divider">
            <button id="flipColorsButton" class="modal-editor-button">Flip Mask Output Color</button>
        </div>
        <div class="modal-editor-divider">
            <button id="downloadButton" class="modal-editor-button">Download Edits</button>
        </div>   
        <div class="modal-editor-divider">
            <label class="modal-editor-title" for="brushSizeSlider">Brush Size:</label>
            <input type="range" class="modal-editor-slider" id="brushSizeSlider" min="1" max="20" step="1" value="5">
        </div>
    </div>
    <div>
        <canvas id="myCanvas" width="400" height="400" style="border:1px solid #000;"></canvas>
        <canvas id="myCanvas2" width="400" height="400" style="border:1px solid #000; display: none"></canvas>
        <canvas id="outputCanvas" width="400" height="400" style="border:1px solid #000; display: none"></canvas>
    </div>
    </div>
  </div>
</div>

<div id="myModal" class="modal-node">
  <div class="modal-node-content">
    <span class="modal-node-close">&times;</span>
    <p id="modalText"></p>
  </div>
</div>

  <div class="col">
    <div class="categories-header">Operators</div>
    
    <div class="operator-categories">Displays</div>
    
    <div class="drag-drawflow" draggable="true" ondragstart="drag(event)" data-node="jsonDisplay">
      <i class="icon">
        <img class="logo" src="assets/json-logo.svg" alt="Icon description" draggable="false">
      </i>
      <span class="operator-title">Display Operator</span>
      <div class="tooltip">
        <i class="far fa-question-circle"></i>
        <span class="tooltiptext">Displays anything that’s not an image</span>
      </div>
    </div>
    
    <div class="drag-drawflow" draggable="true" ondragstart="drag(event)" data-node="imageDisplay">
      <i class="icon">
        <img class="logo" src="assets/image-logo.svg" alt="Icon description" draggable="false">
      </i>
      <span class="operator-title">Image Display Operator</span>
      <div class="tooltip">
        <i class="far fa-question-circle"></i>
        <span class="tooltiptext">Takes in an image file and displays it</span>
      </div>
    </div>
    
    <div class="operator-categories">Prompts</div>
    
    <div class="drag-drawflow" draggable="true" ondragstart="drag(event)" data-node="weightedPrompt">
      <i class="icon">
        <img class="logo" src="assets/image-prompt-logo.svg" alt="Icon description" draggable="false">
      </i>
      <span class="operator-title">Image Prompt Operator</span>
      <div class="tooltip">
        <i class="far fa-question-circle"></i>
        <span class="tooltiptext">Prompt for AI image related operators</span>
      </div>
    </div>
    
    <div class="drag-drawflow" draggable="true" ondragstart="drag(event)" data-node="promptGrouper">
      <i class="icon">
        <img class="logo" src="assets/prompt-grouper-logo.svg" alt="Icon description" draggable="false">
      </i>
      <span class="operator-title">Prompt Grouper</span>
      <div class="tooltip">
        <i class="far fa-question-circle"></i>
        <span class="tooltiptext">Takes up to five prompts and groups it into a list of prompts</span>
      </div>
    </div>
    
    <div class="operator-categories">Image Input</div>
    
    <div class="drag-drawflow" draggable="true" ondragstart="drag(event)" data-node="image">
      <i class="icon">
        <img class="logo" src="assets/image-logo.svg" alt="Icon description" draggable="false">
      </i>
      <span class="operator-title">Image Operator</span>
      <div class="tooltip">
        <i class="far fa-question-circle"></i>
        <span class="tooltiptext">Allows user to upload an image to be used in other operators</span>
      </div>
    </div>
    
    <div class="operator-categories">Text to Image</div>
    
    <div class="drag-drawflow" draggable="true" ondragstart="drag(event)" data-node="textToImage">
      <i class="icon">
        <img class="logo" src="assets/palette-logo.svg" alt="Icon description" draggable="false">
      </i>
      <span class="operator-title">Text to Image Operator</span>
      <div class="tooltip">
        <i class="far fa-question-circle"></i>
        <span class="tooltiptext">Generate a new image from a text prompt</span>
      </div>
    </div>
    
    <div class="drag-drawflow" draggable="true" ondragstart="drag(event)" data-node="dalleTextToImage">
      <i class="icon">
        <img class="logo" src="assets/palette-logo.svg" alt="Icon description" draggable="false">
      </i>
      <span class="operator-title">Dall-E Text to Image</span>
      <div class="tooltip">
        <i class="far fa-question-circle"></i>
        <span class="tooltiptext">Generate a new image from a text prompt using Dall-E 3</span>
      </div>
    </div>
    
    <div class="drag-drawflow" draggable="true" ondragstart="drag(event)" data-node="realVisXLTextToImage">
      <i class="icon">
        <img class="logo" src="assets/palette-logo.svg" alt="Icon description" draggable="false">
      </i>
      <span class="operator-title">RealVisXL Text to Image</span>
      <div class="tooltip">
        <i class="far fa-question-circle"></i>
        <span class="tooltiptext">Generates a new image from a text prompt using RealVisXL. Generates more realistic images</span>
      </div>
    </div>
    
    <div class="operator-categories">Image to Image</div>
    
    <div class="drag-drawflow" draggable="true" ondragstart="drag(event)" data-node="imageToImage">
      <i class="icon">
        <img class="logo" src="assets/palette-logo.svg" alt="Icon description" draggable="false">
      </i>
      <span class="operator-title">Image to Image Operator</span>
      <div class="tooltip">
        <i class="far fa-question-circle"></i>
        <span class="tooltiptext"><p>Generate an image using another image as a starting point <p/> <p><strong>(Only accepts 1024x1024 for SDXL 1.0 and 512x512 for any other engine)</strong></p></span>
      </div>
    </div>
    
    <div class="drag-drawflow" draggable="true" ondragstart="drag(event)" data-node="realVisXLImageToImage">
      <i class="icon">
        <img class="logo" src="assets/palette-logo.svg" alt="Icon description" draggable="false">
      </i>
      <span class="operator-title">RealVisXL Image to Image Operator</span>
      <div class="tooltip">
        <i class="far fa-question-circle"></i>
        <span class="tooltiptext"><p>Generate an image using another image as a starting point. Uses RealVisXL</strong></p></span>
      </div>
    </div>
    
    <div class="drag-drawflow" draggable="true" ondragstart="drag(event)" data-node="photoMaker">
      <i class="icon">
        <img class="logo" src="assets/palette-logo.svg" alt="Icon description" draggable="false">
      </i>
      <span class="operator-title">Photomaker Image to Image Operator</span>
      <div class="tooltip">
        <i class="far fa-question-circle"></i>
        <span class="tooltiptext"><p>Generate an image in a unique style using another image as a starting point.</strong></p></span>
      </div>
    </div>
    
    <div class="operator-categories">Upscalers</div>
    
    <div class="drag-drawflow" draggable="true" ondragstart="drag(event)" data-node="imageUpscaler">
      <i class="icon">
        <img class="logo" src="assets/upscale-logo.svg" alt="Icon description" draggable="false">
      </i>
      <span class="operator-title">Image Upscaler</span>
      <div class="tooltip">
        <i class="far fa-question-circle"></i>
        <span class="tooltiptext">Upscale an image to higher resolution and displays it</span>
      </div>
    </div>
    
    <div class="drag-drawflow" draggable="true" ondragstart="drag(event)" data-node="upscaleTile">
      <i class="icon">
        <img class="logo" src="assets/upscale-tile-logo.svg" alt="Icon description" draggable="false">
      </i>
      <span class="operator-title">Controlnet tile Upscaler</span>
      <div class="tooltip">
        <i class="far fa-question-circle"></i>
        <span class="tooltiptext">Upscale an image to a higher resolution and outputs it</span>
      </div>
    </div>
    
    <div class="operator-categories">Image to Video</div>
    
    <div class="drag-drawflow" draggable="true" ondragstart="drag(event)" data-node="imageToVideo">
      <i class="icon">
        <img class="logo" src="assets/video-logo.svg" alt="Icon description" draggable="false">
      </i>
      <span class="operator-title">Image to Video Operator</span>
      <div class="tooltip">
        <i class="far fa-question-circle"></i>
        <span class="tooltiptext">Generate a video using an image as a starting point
      </div>
    </div>

    <div class="operator-categories">Chat Bot</div>
    
    <div class="drag-drawflow" draggable="true" ondragstart="drag(event)" data-node="chatGPT">
      <i class="icon">
        <img class="logo" src="assets/chat-logo.svg" alt="Icon description" draggable="false">
      </i>
      <span class="operator-title">ChatGPT</span>
      <div class="tooltip">
        <i class="far fa-question-circle"></i>
        <span class="tooltiptext">Allows users to interact with a chat bot using ChatGPT</span>
      </div>
    </div>
    
    <div class="drag-drawflow" draggable="true" ondragstart="drag(event)" data-node="promptMaker">
      <i class="icon">
        <img class="logo" src="assets/chat-logo.svg" alt="Icon description" draggable="false">
      </i>
      <span class="operator-title">Prompt Maker</span>
      <div class="tooltip">
        <i class="far fa-question-circle"></i>
        <span class="tooltiptext">Allows users to come up with a list of five prompts using ChatGPT</span>
      </div>
    </div>
    
    <div class="operator-categories">Inpainting</div>
    
    <div class="drag-drawflow" draggable="true" ondragstart="drag(event)" data-node="imageToImageMasking">
      <i class="icon">
        <img class="logo" src="assets/palette-logo.svg" alt="Icon description" draggable="false">
      </i>
      <span class="operator-title">Mask Image to Image Operator</span>
      <div class="tooltip">
        <i class="far fa-question-circle"></i>
        <span class="tooltiptext">Modify specific portions of an image by using a mask</span>
      </div>
    </div>
    
    <div class="drag-drawflow" draggable="true" ondragstart="drag(event)" data-node="realVisXLMasking">
      <i class="icon">
        <img class="logo" src="assets/palette-logo.svg" alt="Icon description" draggable="false">
      </i>
      <span class="operator-title">RealVisXL Mask Image to Image Operator</span>
      <div class="tooltip">
        <i class="far fa-question-circle"></i>
        <span class="tooltiptext">Modify specific portions of an image by using a mask. Uses RealVisXL.</span>
      </div>
    </div>
    
    <div class="operator-categories">Other</div>

    <div class="drag-drawflow" draggable="true" ondragstart="drag(event)" data-node="python">
      <i class="icon">
        <img class="logo" src="assets/python-logo.svg" alt="Icon description" draggable="false">
      </i>
      <span class="operator-title">Python Operator</span>
      <div class="tooltip">
        <i class="far fa-question-circle"></i>
        <span class="tooltiptext">A dynamic Operator that executes Python code</span>
      </div>
    </div>
 
  </div>

  <div class="col-right">

    <div id="drawflow" ondrop="drop(event)" ondragover="allowDrop(event)">

      <div class="btn-lock">
      
      <div class="loader"></div>
        
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

  <div class="underline-header" id="popupPyMainTitle" style="display: flex;"> Python Operator Settings
    <div class="tooltip">
        <i class="far fa-question-circle"></i>
        <span class="node-tooltiptext">
        <div class="pythonCodeTooltip">
            A dynamic Operator that executes Python code
            <br><br>
            <Strong>Input (User Defined)</Strong>
            <br><Strong>Example Input - </Strong> JSON Display Operator
            <Strong>Output (User Defined)</Strong>
            <br><Strong>Example Connections - </Strong> This can be connected to a <Strong>Image Prompt Operator or Prompt Grouper</Strong>
            <br><br><Strong>Notes:</Strong>
            <br>For your operator to work, define a function and call it at the end of your code like so:
            <br>
<pre class="codeHTML"><code>
\`\`\`python
def add(input_dict):
    …

add
\`\`\`
</code></pre>
            <br>From here you can access all variables using the key “input_{input_number}” where input_number is the number of the output, inputs start from 1.
<pre class="codeHTML"><code>
\`\`\`python
def add(input_dict):
    input_dict = input_dict.to_py()
    x = input_dict[“input_1”]
    y = input_dict[“input_2”]
    sum = x + y
add
\`\`\` 
</code></pre>
            <br>The amount of values you return should correlate to how many outputs you listed, when returning you should 
            always return a dictionary, with keys correlating to how many outputs you listed. Keys must follow this naming 
            standard “output_{input_number}”, outputs also start from 1
            <br><br><Strong>Full Code:</Strong>
            <br>
<pre class="codeHTML"><code>
\`\`\`python
def add(input_dict):
    input_dict = input_dict.to_py()
    x = input_dict[“input_1”]
    y = input_dict[“input_2”]
    sum = x + y 
    return {"output_1": sum}
add
\`\`\` 
</code></pre>
</div>
        </span>
    </div>
  </div>
  
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