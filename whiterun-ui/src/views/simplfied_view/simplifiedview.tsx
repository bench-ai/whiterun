import React, {useEffect, useRef, useState} from 'react';
import {ButtonRow, ModeButton, ModeHeader, ModeSection} from "./simplifiedview.styles";
import Prompts from "./prompts/prompts"
import GeneratorColumn from "./generators/generatorColumn";
import GenerateButton from "./generate/generate";
import {RootState} from "../../state/store";
import {change} from "../../state/mode/modeSlice"
import {useDispatch, useSelector} from "react-redux";
import {Alert, FloatButton, Tour, TourProps} from "antd";
import SimplifiedViewImagesDisplay
    from "./display/simplified_view_images_display";
import SimplifiedInpainting from "./modes/inpainting";
import ImageToImage from "./modes/imageToImage";
import ImageToVideo from "./modes/imageToVideo";
import {reset} from "../../state/generator/generatorSlice"
import {reset as resultReset} from "../../state/results/resultSlice"
import UpscaleImage from "./modes/upscaleImage";
import {QuestionCircleOutlined, BankOutlined} from "@ant-design/icons";


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



    const ref1 = useRef(null);
    const ref2 = useRef(null);
    const ref3 = useRef(null);
    const ref4 = useRef(null);
    const ref5 = useRef(null);
    const ref6 = useRef(null);
    const refNegative = useRef(null);
    const enhanceTour = useRef(null);

    useEffect(() => {
        setGeneratorColumn(<GeneratorColumn/>);
        setPrompt(<Prompts refNegative={refNegative} enhanceTour={enhanceTour}/>)
        setButton(<GenerateButton/>)
    }, []);

    const [open, setOpen] = useState<boolean>(false);

    const steps: TourProps['steps'] = [
        {
            title: 'Start off with selecting a Mode',
            description: 'The mode determines what kind of operations you want to do involving images.',
            target: () => ref1.current,
        },
        {
            title: 'Prompts Section',
            description: 'Determines the prompt you want the model to follow when generating the image. Negative Prompt determines ' +
                "what you don't want to see. The Enhance Prompt option makes the inputted prompt more detailed through AI, generating " +
            "better images",
            target: () => ref2.current,
        },
        {
            title: 'Negative Prompt',
            description: 'Input what you want to avoid seeing',
            target: () => refNegative.current,
        },
        {
            title: 'Enhance Prompt',
            description: 'The Enhance Prompt option makes the inputted prompt more detailed through AI, generating better images',
            target: () => enhanceTour.current,
        },
        {
            title: 'Generate',
            description: 'When ready to generate your image, hit the Generate button',
            target: () => ref3.current,
        },
        {
            title: 'See your Generated Image',
            description: 'Once ready, generated images will appear here with an option to select the generated image as ' +
                'the base image for another mode operation',
            target: () => ref4.current,
        },
        {
            title: 'Enjoy!',
            target: () => null,
        },
    ];

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
                <div ref={ref4}>
                <SimplifiedViewImagesDisplay/>
                </div>
                <div ref={ref1}>
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
                </div>
                <div>
                    <ModeView/>
                </div>
                <div ref={ref2}>
                    {prompt}
                    {/*<Prompts refNegative={refNegative} />*/}
                </div>
                <ModeHeader ref={ref5}>Generators</ModeHeader>
                {generatorColumn}
                <div ref={ref3}>
                    {genButton}
                </div>
            </ModeSection>
            <Tour open={open} onClose={() => setOpen(false)} steps={steps} mask={{
                color: 'rgba(18, 23, 31, .95)',
            }}/>
            <FloatButton.Group shape="square" style={{ right: 24 }}>
                <FloatButton icon={<QuestionCircleOutlined />} type="primary" onClick={() => setOpen(true)} tooltip="Guided Tour"/>
                <FloatButton icon={<BankOutlined />} type="primary" tooltip="Learning Center"/>
                <FloatButton.BackTop visibilityHeight={0} type="primary" />
            </FloatButton.Group>
        </div>
    );
};

export default SimplifiedView;