import {ModeButton} from "../simplifiedview.styles";
import {useDispatch, useSelector} from "react-redux";
import {AppDispatch, RootState} from "../../../state/store";
import {enhancePrompt} from "./requests/chatgpt";
import {resetAlert, updateAlert} from "../../../state/alerts/alertsSlice"
import {GeneratorsMap, Option} from "../../../state/generator/generatorSlice";
import {Result, appendTTIResultAsync, reset, increment, appendUPSResultAsync} from "../../../state/results/resultSlice"

export interface RestructuredGeneratorMap {
    [key: number]: {
        name: string
        settings: {
            [key: string]: string | number | boolean
        }
    }
}

const restructureSettings = (optionArr: Option[]) => {

    const optionMap: { [key: string]: string | number | boolean } = {}

    optionArr.forEach(opt => {
        switch (opt.type) {
            case "numbox":
            case "range":
                if (opt.value) {
                    optionMap[opt.name] = opt.value
                }
                break
            case "switch":
                if (opt.on !== undefined) {
                    console.log("Switch Test 1: "+ opt.on + typeof(opt.on))
                    optionMap[opt.name] = opt.on
                }
                break
            case "list":
                if (opt.options) {
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
    const result = useSelector((state: RootState) => state.result.value);
    const dispatch = useDispatch<AppDispatch>();

    const funcExecute = async () => {

        let positivePrompt = prompt.positivePrompt
        let enhancedPrompt = ""
        let negativePrompt = prompt.negativePrompt

        if (Object.keys(generatorsMap).length === 0){
            return [
                "No Generators have been selected",
                "A Generator is required to generate images. Hit the plus button to select a generator"
            ]
        }

        if (prompt.enhance) {
            if (!prompt.promptStyle) {
                return [
                    "No prompt style was selected",
                    "Prompt styles are near the enhance switch. This will guide the prompt to" +
                    "stick closely to the style you provide"
                ]
            }

            const promptResponse = await enhancePrompt(prompt.positivePrompt, prompt.promptStyle)
            if (!promptResponse.success) {
                return [
                    "Cannot generate prompt",
                    promptResponse.error ? promptResponse.error : "Critical Error unable to generate a response"
                ]
            }

            if (!promptResponse.response) {
                return [
                    "Cannot generate prompt",
                    "Critical Error unable to generate a response"
                ]
            } else {
                enhancedPrompt = promptResponse.response[0]
            }
        }

        const resMap = restructureMap(generatorsMap)

        Object.keys(resMap).forEach(k => {
            console.log("Negative: " + negativePrompt)
            const res: Result = {
                name: resMap[parseInt(k)].name,
                settings: resMap[parseInt(k)].settings,
                positivePrompt: positivePrompt,
                negativePrompt: negativePrompt,
                enhanced: prompt.enhance,
                mask: mode.mask,
                image: mode.image
            }

            if (prompt.enhance) {
                res.enhancedPrompt = enhancedPrompt
                res.promptStyle = prompt.promptStyle
            }

            dispatch(increment())
            switch (mode.name) {
                case "tti":
                    dispatch(appendTTIResultAsync(res))
                    break
                case "ups":
                    dispatch(appendUPSResultAsync(res))
                    break
                default:
                    console.error("in unknown case")
            }
        })

        return ["success"]
    }

    const executeWrapper = async () => {
        dispatch(resetAlert())
        dispatch(reset())
        const responseArr = await funcExecute()

        if (responseArr.length == 2) {
            dispatch(updateAlert({
                message: responseArr[0],
                description: responseArr[1],
                level: "error"
            }))
        }
    }

    return (
        <ModeButton
            onClick={() => (result.resultArr.length === result.pendingCount) ? executeWrapper() : null}
            style={{
                backgroundColor: result.resultArr.length === result.pendingCount ? '#53389E': '#999',
                color: result.resultArr.length === result.pendingCount ? 'white' : '#666',
                marginTop: '50px',
                maxWidth: '250px',
                textAlign: 'center',
                fontSize: '30px',
                cursor: result.resultArr.length === result.pendingCount ? 'pointer': 'not-allowed',
            }}
        >
            <b>Generate</b>
        </ModeButton>
    );
};

export default GenerateButton;