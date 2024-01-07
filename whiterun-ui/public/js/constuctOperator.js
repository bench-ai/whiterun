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

export async function collectOperatorMetaData(name){

  let viz;
  let dataList;
  let operatorTitle;
  let operatorLogo;

  switch (name){

    case "image":
      viz = await fetchHTML("image");
      dataList = await fetchJSON("image");
      operatorTitle = "Image Operator";
      operatorLogo = "assets/image-logo.svg";
      break;

    case "jsonDisplay":
      viz = await fetchHTML("jsonDisplay");
      dataList = await fetchJSON("json_display");
      operatorTitle = "Json Display Operator";
      operatorLogo = "assets/json-logo.svg";
      break;

    case "slider":
      viz = await fetchHTML("slider");
      dataList = await fetchJSON("slider");
      operatorTitle = "Slider Operator";
      operatorLogo = "assets/slider-logo.svg";
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
      break;

    case "promptGrouper":
      viz = await fetchHTML("promptGrouper");
      dataList = await fetchJSON("prompt_grouper");
      operatorTitle = "Prompt Grouper";
      operatorLogo = "assets/prompt-grouper-logo.svg";
      break;

    default:
      throw new Error("invalid name")
  }

  return [viz, dataList[0], dataList[1], operatorTitle, operatorLogo]
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
      inputField += `<input class="${className}" type="text" name={value_name} value={default_value}>
        `.replace('{default_value}', def).replace('{value_name}',currentMap["name"])
    }else{
      inputField += `<input class="${className}" type="text" name={value_name}>
        `.replace('{value_name}',currentMap["name"])
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
                         logo){

  let titleBox = `<div class="title-box">
                        {name}
                        <i class="operator-image">
                            <img class="node-logo" src={logo}>
                        </i>
                    </div>`.replace('{name}', name).replace('{logo}', logo)

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
