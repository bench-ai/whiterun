import {operatorHandler} from "./handlers/operator.js";
import {PythonHandler} from "./handlers/python.js";
import {ImageHandler} from "./handlers/imageInput.js";
import {JsonDisplayHandler} from "./handlers/jsonDisplay.js";
import {ImagePromptHandler} from "./handlers/imagePrompt.js";
import {promptGrouperHandler} from "./handlers/promptGrouper.js";
import {textToImageHandler} from "./handlers/stableTextToImage.js"
import {ImageDisplayHandler} from "./handlers/imageDisplay.js"
import {ImageToImageHandler} from "./handlers/stableImageToImage.js"
import {ImageUpscalerHandler} from "./handlers/esrganUpscaler.js"
import {ImageToImageMaskHandler} from "./handlers/stableImageToImageMask.js";
import {DallETextToImageHandler} from "./handlers/dalleTextToImage.js";
import {RealVisXLTextToImageHandler} from "./handlers/realvisxlTextToImage.js";
import {TileUpscaleHandler} from "./handlers/controlnetTileUpscaler.js";
import {RealVisXLImageToImageHandler} from "./handlers/realVisXLImageToImage.js";
import {RealVisXLMask} from "./handlers/realVisXLMask.js";

export function getOperator(nodeId, editor) {
  const idNode = "node-{id}".replace("{id}", nodeId)
  const op = new operatorHandler(editor, idNode);

  switch (op.name) {
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
    case 'upscaleTile':
      return new TileUpscaleHandler(editor, idNode)
    case 'dalleTextToImage':
      return new DallETextToImageHandler(editor, idNode)
    case 'realVisXLTextToImage':
      return new RealVisXLTextToImageHandler(editor, idNode)
    case 'realVisXLImageToImage':
      return new RealVisXLImageToImageHandler(editor, idNode)
    case 'realVisXLMasking':
      return new RealVisXLMask(editor, idNode)
    default:
      throw new ReferenceError("operator does not exist")
  }
}

export async function getSaveViz(name, dataDict) {

  switch (name) {
    case 'python':
      return await PythonHandler.load(dataDict)
    case 'image':
      return await ImageHandler.load(dataDict)
    case 'jsonDisplay':
      return await JsonDisplayHandler.load(dataDict)
    case 'weightedPrompt':
      return await ImagePromptHandler.load(dataDict)
    case 'promptGrouper':
      return await promptGrouperHandler.load(dataDict)
    case 'textToImage':
      return await textToImageHandler.load(dataDict)
    case 'imageDisplay':
      return await ImageDisplayHandler.load(dataDict)
    case 'imageToImage':
      return await ImageToImageHandler.load(dataDict)
    case 'imageUpscaler':
      return await ImageUpscalerHandler.load(dataDict)
    case 'imageToImageMasking':
      return await ImageToImageMaskHandler.load(dataDict)
    case 'upscaleTile':
      return await TileUpscaleHandler.load(dataDict)
    case 'dalleTextToImage':
      return await DallETextToImageHandler.load(dataDict)
    case 'realVisXLTextToImage':
      return await RealVisXLTextToImageHandler.load(dataDict)
    case 'realVisXLImageToImage':
      return await RealVisXLImageToImageHandler.load(dataDict)
    case 'realVisXLMasking':
      return await RealVisXLMask.load(dataDict)
    default:
      throw new ReferenceError("operator does not exist")
  }
}

