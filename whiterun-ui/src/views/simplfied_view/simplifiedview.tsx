import React, {useEffect, useState} from 'react';
import {ButtonRow, ModeButton, ModeHeader, ModeSection} from "./simplifiedview.styles";
import Prompts from "./prompts/prompts"
import GeneratorColumn from "./generators/generatorColumn";
import SimplifiedInpainting from "./modes/inpainting";
import ImageToImage from "./modes/imageToImage";
import ImageToVideo from "./modes/imageToVideo";
import { RootState } from "../../state/store";
import {change} from "../../state/mode/modeSlice"
import {useDispatch, useSelector} from "react-redux";

const SimplifiedView = () => {

    useEffect(() => {
        document.title = 'Workbench Lite - Bench AI';
    })

    const mode = useSelector((state: RootState) => state.mode.value);
    const dispatch = useDispatch();

    const [modeBody, setModeBody] = useState<React.ReactElement | null>(null);
    const [generatorColumn, setGeneratorColumn] = useState<React.ReactElement | null>(null);
    const [prompt, setPrompt] = useState<React.ReactElement | null>(null);

    function addView(currentMode: string) {
        switch (currentMode){
            case "tti":
                setModeBody(<div></div>)
                break;
            case "inp":
                console.log("Switched")
                setModeBody(<SimplifiedInpainting />)
                break;
            case "iti":
                setModeBody(<ImageToImage />)
                break;
            case "anm":
                setModeBody(<ImageToVideo />)
                break;
            default:
                break;
        }

        dispatch(change({
            name: currentMode
        }));
    }

    useEffect(() => {
        addView(mode.name);
        setGeneratorColumn(<GeneratorColumn />);
        setPrompt(<Prompts />)
    }, []);

    return (
        <div>
            <ModeSection>
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
                    {modeBody}
                </div>
                <div>
                    {prompt}
                </div>
                <ModeHeader>Generators</ModeHeader>
                {generatorColumn}
            </ModeSection>
        </div>
    );
};

export default SimplifiedView;