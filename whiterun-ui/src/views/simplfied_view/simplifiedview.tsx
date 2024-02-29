import React, {useEffect, useState} from 'react';
import {ButtonRow, ModeButton, ModeHeader, ModeSection} from "./simplifiedview.styles";
import TextToImage from "./modes/textToImage"
import GeneratorColumn from "./generators/generatorColumn";
import SimplifiedInpainting from "./modes/inpainting";
import ImageToImage from "./modes/imageToImage";
import ImageToVideo from "./modes/imageToVideo";

const SimplifiedView = () => {

    useEffect(() => {
        document.title = 'Workbench Lite - Bench AI';
    })

    const [selectedMode, setSelectedMode] = useState("");
    const [modeBody, setModeBody] = useState<React.ReactElement | null>(null);
    const [generatorColumn, setGeneratorColumn] = useState<React.ReactElement | null>(GeneratorColumn);


    function addView(currentMode: string) {
        const previousMode = document.getElementById(selectedMode);
        const mode = document.getElementById(currentMode);

        if (previousMode) {
            previousMode.style.color = 'black';
            previousMode.style.background = 'white';
        }

        if (mode) {
            mode.style.background = '#53389E';
            mode.style.color = 'white';
        }

        switch (currentMode){
            case "tti":
                setModeBody(<TextToImage />);
                break;
            case "inp":
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

        setSelectedMode(currentMode);
    }

    useEffect(() => {
        addView("tti");
    }, []);

    return (
        <div>
            <ModeSection>
                <ModeHeader>Mode</ModeHeader>
                <ButtonRow>
                    <ModeButton id="tti" className="mode-button" onClick={() => addView('tti')}><b>Text To
                        Image</b></ModeButton>
                    <ModeButton id="iti" className="mode-button" onClick={() => addView('iti')}><b>Image To
                        Image</b></ModeButton>
                    <ModeButton id="inp" className="mode-button"
                                onClick={() => addView('inp')}><b>Inpaint</b></ModeButton>
                    <ModeButton id="ups" className="mode-button"
                                onClick={() => addView('ups')}><b>Upscale</b></ModeButton>
                    <ModeButton id="anm" className="mode-button"
                                onClick={() => addView('anm')}><b>Animate</b></ModeButton>
                </ButtonRow>
                <div>
                    {modeBody}
                </div>
                <ModeHeader>Generators</ModeHeader>
                {generatorColumn}
            </ModeSection>
        </div>
    );
};

export default SimplifiedView;