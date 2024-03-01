import {ModeButton} from "../simplifiedview.styles";
import {useDispatch, useSelector} from "react-redux";
import {RootState} from "../../../state/store";
import {enhancePrompt} from "./requests/chatgpt";
import {resetAlert, updateAlert} from "../../../state/alerts/alertsSlice"
import {GeneratorsMap} from "../../../state/generator/generatorSlice";
import {Option} from "../../../state/generator/generatorSlice"
import {ImageRequest, textToImage} from "./requests/apiHandler";

export interface RestructuredGeneratorMap{
    [key: number]:{
        name: string
        settings: {
            [key: string]: string | number | boolean
        }
    }
}

const restructureSettings = (optionArr: Option[]) => {

    const optionMap: { [key: string]: string | number | boolean} = {}

    optionArr.forEach(opt => {
        switch (opt.type){
            case "numbox":
            case "range":
                if (opt.value){
                    optionMap[opt.name] = opt.value
                }
                break
            case "switch":
                if (opt.on) {
                    optionMap[opt.name] = opt.on
                }
                break
            case "list":
                if (opt.options){
                    optionMap[opt.name] = opt.options[0]
                }
                break
            default:
                break
        }
    })

    return optionMap
}


const restructureMap = (mp: GeneratorsMap) => {
    const gm: RestructuredGeneratorMap = {}
    Object.keys(mp).forEach(k => {
        gm[parseInt(k)] = {
            name: mp[parseInt(k)].name,
            settings: restructureSettings(mp[parseInt(k)].settings)
        }
    })

    return gm
}


const GenerateButton = () => {

    const mode = useSelector((state: RootState) => state.mode.value);
    const prompt = useSelector((state: RootState) => state.prompt.value);
    const generatorsMap = useSelector((state: RootState) => state.generator.value);
    const dispatch = useDispatch();

    const funcExecute = async () => {

        let positivePrompt = prompt.positivePrompt
        let negativePrompt = prompt.negativePrompt

        if(prompt.enhance){
            if(!prompt.promptStyle){
                return [
                    "No prompt style was selected",
                    "Prompt styles are near the enhance switch. This will guide the prompt to" +
                    "stick closely to the style you provide"
                ]
            }

            const promptResponse = await enhancePrompt(prompt.positivePrompt, prompt.promptStyle)
            if (!promptResponse.success){
                return [
                    "Cannot generate prompt",
                    promptResponse.error ? promptResponse.error : "Critical Error unable to generate a response"
                ]
            }

            if (!promptResponse.response){
                return [
                    "Cannot generate prompt",
                    "Critical Error unable to generate a response"
                ]
            }else{
                positivePrompt = promptResponse.response[0]
            }
        }

        switch (mode.name){
            case "tti":

                const resMap = restructureMap(generatorsMap)
                const requestList: Promise<ImageRequest>[] = []

                Object.keys(resMap).forEach(k => {
                    requestList.push(
                        textToImage(
                            positivePrompt,
                            negativePrompt,
                            resMap[parseInt(k)].name,
                            resMap[parseInt(k)].settings)
                    )
                })

                for (let i = 0; i < requestList.length; i++){
                    console.log(await requestList[i])
                }

                break
            default:
                console.error("in unknown case")
        }

        return ["success"]
    }

    const executeWrapper = async () => {
        dispatch(resetAlert())
        const responseArr = await funcExecute()

        if (responseArr.length == 2){
            dispatch(updateAlert({
                message: responseArr[0],
                description: responseArr[1],
                level: "error"
            }))
        }
    }

    return (
        <ModeButton
            onClick={executeWrapper}
            style={{
                backgroundColor: '#53389E',
                color: 'white',
                marginTop: '50px',
                maxWidth: '250px',
                textAlign: 'center',
                fontSize: '30px',
                cursor: 'pointer',
            }}
        >
            <b>Generate</b>
        </ModeButton>
    );
};

export default GenerateButton;