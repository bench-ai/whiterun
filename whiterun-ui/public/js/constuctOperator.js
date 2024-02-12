export async function fetchHTML(fileName){
  let filePath = `./js/htmlVisualizations/{fileName}.html`
  filePath = filePath.replace("{fileName}", fileName)

  const response = await fetch(filePath);

  if (!response.ok) {
    throw new Error(`Failed to fetch HTML file (status ${response.status})`);
  }

  return await response.text();

}

async function fetchJSON(name){
  let filePath = `./js/jsonStructures/{fileName}.json`
  filePath = filePath.replace("{fileName}", name)

  const response = await fetch(filePath);

  if (!response.ok) {
    throw new Error(`Failed to fetch HTML file (status ${response.status})`);
  }

  const object = await response.json()
  return [object["inputs"], object["outputs"]]
}

export async function fetchTooltipContent(fileName){
  let filePath = `./js/htmlTooltips/{fileName}Tooltip.html`
  filePath = filePath.replace("{fileName}", fileName)

  const response = await fetch(filePath);

  if (!response.ok) {
    throw new Error(`Failed to fetch HTML file (status ${response.status})`);
  }

  return await response.text();

}


export async function collectOperatorMetaData(name){

  let viz;
  let dataList;
  let operatorTitle;
  let operatorLogo;
  let operatorTooltip;

  switch (name){

    case "image":
      viz = await fetchHTML("image");
      dataList = await fetchJSON("image");
      operatorTitle = "Image Operator";
      operatorLogo = "assets/image-logo.svg";
      operatorTooltip = await fetchTooltipContent("image");
      break;

    case "jsonDisplay":
      viz = await fetchHTML("jsonDisplay");
      dataList = await fetchJSON("json_display");
      operatorTitle = "Json Display Operator";
      operatorLogo = "assets/json-logo.svg";
      operatorTooltip = await fetchTooltipContent("jsonDisplay");
      break;

    case "text":
      viz = await fetchHTML("text");
      dataList = await fetchJSON("text");
      operatorTitle = "Text Operator";
      operatorLogo = "assets/text-logo.svg";
      break;

    case "weightedPrompt":
      viz = await fetchHTML("imagePrompt");
      dataList = await fetchJSON("image_prompt");
      operatorTitle = "Image Prompt Operator";
      operatorLogo = "assets/image-prompt-logo.svg";
      operatorTooltip = await fetchTooltipContent("weightedPrompt");
      break;

    case "promptGrouper":
      viz = await fetchHTML("promptGrouper");
      dataList = await fetchJSON("prompt_grouper");
      operatorTitle = "Prompt Grouper";
      operatorLogo = "assets/prompt-grouper-logo.svg";
      operatorTooltip = await fetchTooltipContent("promptGrouper");
      break;

    case "textToImage":
      viz = await fetchHTML("textToImage");
      dataList = await fetchJSON("text_to_image");
      operatorTitle = "Text to Image";
      operatorLogo = "assets/palette-logo.svg";
      operatorTooltip = await fetchTooltipContent("textToImage");
      break;

    case "imageUpscaler":
      viz = await fetchHTML("imageUpscaler");
      dataList = await fetchJSON("image_upscaler");
      operatorTitle = "Image Upscaler";
      operatorLogo = "assets/upscale-logo.svg";
      operatorTooltip = await fetchTooltipContent("imageUpscaler");
      break;

    case "imageDisplay":
      viz = await fetchHTML("imageDisplay");
      dataList = await fetchJSON("image_display");
      operatorTitle = "Image Display";
      operatorLogo = "assets/image-logo.svg";
      operatorTooltip = await fetchTooltipContent("imageDisplay");
      break;

    case "imageToImage":
      viz = await fetchHTML("imageToImage");
      dataList = await fetchJSON("image_to_image");
      operatorTitle = "Image to Image";
      operatorLogo = "assets/image-logo.svg";
      operatorTooltip = await fetchTooltipContent("imageToImage");
      break;

    case "imageToImageMasking":
      viz = await fetchHTML("imageToImageMasking");
      dataList = await fetchJSON("image_to_image_masking");
      operatorTitle = "Image to Image Masking";
      operatorLogo = "assets/image-logo.svg";
      operatorTooltip = await fetchTooltipContent("imageToImageMasking");
      break;

    case "upscaleTile":
      viz = await fetchHTML("controlNetTile");
      dataList = await fetchJSON("controlnet_tile");
      operatorTitle = "Controlnet Tile Upscaler";
      operatorLogo = "assets/upscale-tile-logo.svg";
      operatorTooltip = await fetchTooltipContent("controlNetTile");
      break;

    case "dalleTextToImage":
      viz = await fetchHTML("dalleTextToImage");
      dataList = await fetchJSON("dalle_text_to_image");
      operatorTitle = "Dall-E Text to Image";
      operatorLogo = "assets/palette-logo.svg";
      operatorTooltip = await fetchTooltipContent("dalleTextToImage");

      break;

    case "realVisXLTextToImage":
      viz = await fetchHTML("realVisTextToImage");
      dataList = await fetchJSON("real_vis_text_to_image");
      operatorTitle = "RealVisXL Text to Image";
      operatorLogo = "assets/palette-logo.svg";
      operatorTooltip = await fetchTooltipContent("realVisTextToImage");
      break;

    case "python":
      viz = await fetchHTML('pythonViz');
      dataList = [{}, {}]
      operatorTitle = "Python Operator"
      operatorLogo = "assets/python-logo.svg";
      operatorLogo = "assets/python-logo.svg";
      operatorTooltip = "A dynamic Operator that executes Python code<br><Strong>Input - " +
          "</Strong>User Defined<br><Strong>Output - </Strong>User Defined";
      break;

    case "realVisXLImageToImage":
      viz = await fetchHTML("realVisImgToImg");
      dataList = await fetchJSON("real_vis_img_to_img");
      operatorTitle = "RealVisXL Image to Image Operator";
      operatorLogo = "assets/image-logo.svg";
      operatorTooltip = await fetchTooltipContent("realVisImgToImg")
      break;

    case "realVisXLMasking":
      viz = await fetchHTML("realVisMasking");
      dataList = await fetchJSON("real_vis_masking");
      operatorTitle = "RealVISXL Masking Operator";
      operatorLogo = "assets/image-logo.svg";
      operatorTooltip = await fetchTooltipContent("realVisMasking")
      break;

    case "photoMaker":
      viz = await fetchHTML("photomaker");
      dataList = await fetchJSON("photomaker");
      operatorTitle = "Photomaker Image to Image Operator";
      operatorLogo = "assets/image-logo.svg";
      operatorTooltip = await fetchTooltipContent("photomaker")
      break;

    default:
      throw new Error("invalid name")
  }

  return [viz, dataList[0], dataList[1], operatorTitle, operatorLogo, operatorTooltip]
}

function getPropertyDiv(dataArr, isStatic){
  let wholeInput = ""
  let className;
  let fieldName;

  if (isStatic){
    className = "insert-field-static";
    fieldName = "field-header-static"
  }else{
    className = "insert-field-dynamic";
    fieldName = "field-header-dynamic"
  }

  for (let i = 0; i < dataArr.length; i++){
    const currentMap = dataArr[i]
    let def = currentMap["default_value"]

    if (typeof(def) === "object"){
      def = JSON.stringify(currentMap["default_value"])
    }

    let inputField = `<div class="input-field">`
    inputField += `<div class="${fieldName}">
                        {name}: <span class="colored-text">{type}</span>
                     </div>`.replace('{name}', currentMap["name"]).replace('{type}', currentMap["type"])

    if (currentMap.hasOwnProperty("default_value")){
      if (isStatic){
        inputField += `<input class="${className}" type="text" name={value_name} value={default_value}>
        `.replace('{default_value}', def).replace('{value_name}',currentMap["name"])
      }else{
        inputField += `<input disabled class="${className}" type="text" name={value_name} value={default_value}>
        `.replace('{default_value}', def).replace('{value_name}',currentMap["name"])
      }
    }else{
      if (isStatic){
        inputField += `<input class="${className}" type="text" name={value_name}>
        `.replace('{value_name}',currentMap["name"])
      }else{
        inputField += `<input disabled class="${className}" type="text" name={value_name}>
        `.replace('{value_name}',currentMap["name"])
      }
    }
    inputField += "</div>"
    wholeInput += inputField
  }

  return wholeInput
}

function getOutputDiv(dataArr){
  let wholeOutput = `<div class="output-field">`

  for (let i = 0; i < dataArr.length; i++){
    let outputField = `<div class="output-field">`
    const currentMap = dataArr[i]
    outputField += `<div class="output-type">{type}</div>`.replace('{type}', currentMap["type"])
    outputField += "</div>"
    wholeOutput += outputField
  }

  return wholeOutput;
}

function constructFullHtml(title, stat, dynamic, output){
  let fullBox = `
        <div>
        {title_box}
        <div class="box">`.replace("{title_box}", title)

  if (stat){
    fullBox+= `
        <div class="section-header">Static Properties</div>
        {input_field}`.replace("{input_field}", stat)
  }

  if (dynamic){
    fullBox+= `
        <div class="section-header">Dynamic Properties</div>
        {input_field}`.replace("{input_field}", dynamic)
  }

  if (output){
    fullBox+= `
        <div class="section-header">Output(s)</div>
        {output_field}
        </div>
        {viz}
        </div>`.replace("{output_field}", output)
  }else{
    fullBox+= `
        {viz}
        </div>`.replace("{output_field}", output)
  }

  return fullBox
}



export function mapToDiv(inputMapArr,
                         outPutMapArr,
                         name,
                         logo,
                         tooltip){


  let titleBox = `<div class="title-box">
                        <i class="operator-image">
                            <img class="node-logo" src={logo}>
                        </i>
                        {name}
                        <div class="tooltip">
                            <div class="hiddenToolTipText" style="display:none;">{tooltip}</div>
                            <img class="helpLogoTooltipNode" src="assets/help-logo.svg" alt="help logo" onClick="openModal(event)">
                        </div>
                    </div>`
      .replace('{name}', name).replace('{logo}', logo)
      .replace('{tooltip}', tooltip)

  let hasStatic = "";
  let hasDynamic = "";
  let hasOutput = "";

  if (inputMapArr["static"].length > 0){
    hasStatic = getPropertyDiv(inputMapArr["static"], true)
  }

  if (inputMapArr["dynamic"].length > 0){
    hasDynamic = getPropertyDiv(inputMapArr["dynamic"], false)
  }

  if (outPutMapArr.length > 0){
    hasOutput = getOutputDiv(outPutMapArr)
  }

  return constructFullHtml(titleBox, hasStatic, hasDynamic, hasOutput)
}

window.openModal = function(event) {
  const modal = document.getElementById('myModal');
  const modalTextElement = document.getElementById('modalText');

  // Set the modal text
  modalTextElement.innerHTML = event.target.parentElement.getElementsByClassName("hiddenToolTipText")[0].innerHTML;

  // Display the modal
  modal.style.display = 'block';

  // Add an event listener to close the modal when the '×' is clicked
  const closeBtn = document.getElementsByClassName('modal-node-close')[0];
  closeBtn.onclick = function() {
    modal.style.display = 'none';
  };

  // Close the modal if the user clicks outside the modal
  window.onclick = function(event) {
    if (event.target === modal) {
      modal.style.display = 'none';
    }
  };
};
