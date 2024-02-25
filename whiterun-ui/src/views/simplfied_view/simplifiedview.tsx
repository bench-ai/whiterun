import React, {useEffect, useState} from 'react';
import {ButtonRow, ModeButton, ModeHeader, ModeSection} from "./simplifiedview.styles";

const SimplifiedView = () => {

    useEffect(() => {
        document.title = 'Workbench Lite - Bench AI';
    })


    const [selectedMode, setSelectedMode] = useState("");
    const [variableOne, setVariableOne] = useState("");

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

        setVariableOne(currentMode);
        setSelectedMode(currentMode);
    }

    useEffect(() => {
        addView("tti")
    })

    return (
        <div className="center-container">
            <ModeSection>
                <ModeHeader>Mode</ModeHeader>
                <ButtonRow >
                    <ModeButton id="tti" className="mode-button" onClick={() => addView('tti')}><b>Text To Image</b></ModeButton>
                    <ModeButton id="iti" className="mode-button" onClick={() => addView('iti')}><b>Image To Image</b></ModeButton>
                    <ModeButton id="inp" className="mode-button" onClick={() => addView('inp')}><b>Inpaint</b></ModeButton>
                    <ModeButton id="ups" className="mode-button" onClick={() => addView('ups')}><b>Upscale</b></ModeButton>
                    <ModeButton id="anm" className="mode-button" onClick={() => addView('anm')}><b>Animate</b></ModeButton>
                </ButtonRow>
            </ModeSection>
            <div className="mode-layout">
                {variableOne}
            </div>
        </div>
    );
};

export default SimplifiedView;