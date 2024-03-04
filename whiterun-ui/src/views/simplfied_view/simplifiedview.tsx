import React, {useEffect, useState} from 'react';
import {ButtonRow, ModeButton, ModeHeader, ModeSection} from "./simplifiedview.styles";
import Prompts from "./prompts/prompts"
import GeneratorColumn from "./generators/generatorColumn";
import GenerateButton from "./generate/generate";
import {RootState} from "../../state/store";
import {change} from "../../state/mode/modeSlice"
import {useDispatch, useSelector} from "react-redux";
import {Alert} from "antd";
import SimplifiedViewImagesDisplay
    from "./display/simplified_view_images_display";
import SimplifiedInpainting from "./modes/inpainting";
import ImageToImage from "./modes/imageToImage";
import ImageToVideo from "./modes/imageToVideo";
import {reset} from "../../state/generator/generatorSlice"
import {reset as resultReset} from "../../state/results/resultSlice"
import UpscaleImage from "./modes/upscaleImage";


const ModeView = () => {
    const mode = useSelector((state: RootState) => state.mode.value);
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(change({
            name: mode.name,
            image: mode.image,
            mask: mode.mask
        }));
        dispatch(reset());
        dispatch(resultReset());
    }, [mode.name]);

    let modeBody: React.ReactElement = <div></div>

    switch (mode.name) {
        case "tti":
            modeBody = <div></div>
            break;
        case "inp":
            modeBody = <SimplifiedInpainting/>
            break;
        case "iti":
            modeBody = <ImageToImage/>
            break;
        case "anm":
            modeBody = <ImageToVideo/>
            break;
        case "ups":
            modeBody = <UpscaleImage/>
            break;
        default:
            break;
    }

    return(
        modeBody
    )
}

const SimplifiedView = () => {

    useEffect(() => {
        document.title = 'Workbench Lite - Bench AI';
    })

    const mode = useSelector((state: RootState) => state.mode.value);
    const alert = useSelector((state: RootState) => state.alert.value);

    const dispatch = useDispatch();

    const [generatorColumn, setGeneratorColumn] =
        useState<React.ReactElement | null>(null);
    const [prompt, setPrompt] =
        useState<React.ReactElement | null>(null);
    const [genButton, setButton] =
        useState<React.ReactElement | null>(null);


    function addView(currentMode: string) {
        dispatch(change({
            name: currentMode,
            image: []
        }));
    }

    useEffect(() => {
        setGeneratorColumn(<GeneratorColumn/>);
        setPrompt(<Prompts/>)
        setButton(<GenerateButton/>)
    }, []);

    return (
        <div>
            <ModeSection>
                {alert.level !== "calm" && (
                    <>
                        {console.log("Alert level:", alert.level)}
                        <Alert
                            message={<strong>{alert.message}</strong>}
                            description={alert.description}
                            type="error"
                            showIcon
                            style={{marginTop: "20px", marginBottom: "30px"}}
                        />
                    </>
                )}
                <SimplifiedViewImagesDisplay/>
                <ModeHeader>Mode</ModeHeader>
                <ButtonRow>

                    <ModeButton
                        onClick={() => addView('tti')}
                        style={{
                            backgroundColor: mode.name === "tti" ? '#53389E' : 'white',
                            color: mode.name === "tti" ? 'white' : 'black'
                        }}
                    >
                        <b>Text To Image</b>
                    </ModeButton>

                    <ModeButton
                        onClick={() => addView('iti')}
                        style={{
                            backgroundColor: mode.name === "iti" ? '#53389E' : 'white',
                            color: mode.name === "iti" ? 'white' : 'black'
                        }}
                    >
                        <b>Image To Image</b>
                    </ModeButton>

                    <ModeButton
                        onClick={() => addView('inp')}
                        style={{
                            backgroundColor: mode.name === "inp" ? '#53389E' : 'white',
                            color: mode.name === "inp" ? 'white' : 'black'
                        }}
                    >
                        <b>Inpaint</b>
                    </ModeButton>

                    <ModeButton
                        onClick={() => addView('ups')}
                        style={{
                            backgroundColor: mode.name === "ups" ? '#53389E' : 'white',
                            color: mode.name === "ups" ? 'white' : 'black'
                        }}
                    >
                        <b>Upscale</b>
                    </ModeButton>

                    <ModeButton
                        onClick={() => addView('anm')}
                        style={{
                            backgroundColor: mode.name === "anm" ? '#53389E' : 'white',
                            color: mode.name === "anm" ? 'white' : 'black'
                        }}
                    >
                        <b>Animate</b>
                    </ModeButton>

                </ButtonRow>
                <div>
                    <ModeView/>
                </div>
                <div>
                    {prompt}
                </div>
                <ModeHeader>Generators</ModeHeader>
                {generatorColumn}
                <div>
                    {genButton}
                </div>
            </ModeSection>
        </div>
    );
};

export default SimplifiedView;