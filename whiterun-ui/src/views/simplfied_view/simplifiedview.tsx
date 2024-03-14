import React, {useEffect, useRef, useState} from 'react';
import {ButtonRow, ModeButton, ModeHeader, ModeSection} from "./simplifiedview.styles";
import Prompts from "./prompts/prompts"
import GeneratorColumn from "./generators/generatorColumn";
import GenerateButton from "./generate/generate";
import {RootState} from "../../state/store";
import {change} from "../../state/mode/modeSlice"
import {useDispatch, useSelector} from "react-redux";
import {FloatButton, Tour, TourProps, message} from "antd";
import SimplifiedViewImagesDisplay
    from "./display/simplified_view_images_display";
import SimplifiedInpainting from "./modes/inpainting";
import {reset} from "../../state/generator/generatorSlice"
import {reset as resultReset} from "../../state/results/resultSlice"
import UpscaleImage from "./modes/upscaleImage";
import {QuestionCircleOutlined, BankOutlined} from "@ant-design/icons";
import LearningCenter from "../../components/learning_center/learning_center";
import {HelpModal} from "../workbench/workbench.styles";
import axios from "axios";


const ModeView = () => {
    const mode = useSelector((state: RootState) => state.mode.value);
    const dispatch = useDispatch();
    const baseURL = process.env.REACT_APP_DEV === 'true' ? `http://localhost:8080/api` : 'https://app.bench-ai.com/api';

    useEffect(() => {
        (async () => {
            try {
                await axios.post(`${baseURL}/auth/test`, {}, {
                    withCredentials: true,
                });
            } catch (e) {

            }
        })();
    }, [baseURL]);

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
            modeBody = <UpscaleImage/>
            break;
        case "anm":
            modeBody = <UpscaleImage/>
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

    const [isModalOpen, setIsModalOpen] = useState(false);

    const showModal = () => {
        setIsModalOpen(true);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    function addView(currentMode: string) {
        dispatch(change({
            name: currentMode,
            image: []
        }));
    }



    const tourMode = useRef(null);
    const tourPrompts = useRef(null);
    const tourGenerate = useRef(null);
    const tourView = useRef(null);
    const tourGenerators = useRef(null);
    const tourNegative = useRef(null);
    const tourEnhance = useRef(null);

    useEffect(() => {
        setGeneratorColumn(<GeneratorColumn/>);
        setPrompt(<Prompts negativeTour={tourNegative} enhanceTour={tourEnhance}/>)
        setButton(<GenerateButton/>)
    }, []);

    const [open, setOpen] = useState<boolean>(false);

    const steps: TourProps['steps'] = [
        {
            title: 'Start off with selecting a Mode',
            description: 'The mode determines what kind of operations you want to do involving images.',
            target: () => tourMode.current,
        },
        {
            title: 'Prompts Section',
            description: 'Determines the prompt you want the model to follow when generating the image.',
            target: () => tourPrompts.current,
        },
        {
            title: 'Negative Prompt',
            description: 'Input what you want to avoid seeing when generating the image.',
            target: () => tourNegative.current,
        },
        {
            title: 'Enhance Prompt',
            description: 'The Enhance Prompt option makes the inputted prompt more detailed through AI, generating better images.' +
                ' Selecting a style caters the generated prompt to that style.',
            target: () => tourEnhance.current,
        },
        {
            title: 'Generators',
            description: "You can change the model used to generate each image by selecting a generator. You can select multiple generators, " +
                "each with their own settings for the same image. You can only have one generator when inputting more than one image.",
            target: () => tourGenerators.current,
        },
        {
            title: 'Generate',
            description: 'When ready to generate your image, hit the Generate button',
            target: () => tourGenerate.current,
        },
        {
            title: 'See your Generated Image',
            description: 'Once ready, your generated images will appear here with an option to select the chosen image(s) as ' +
                'the base image for another operation. You can also click on the info button in the top right to see ' +
                'all the settings used to generate that image.',
            target: () => tourView.current,
        },
        {
            title: 'Enjoy!',
            target: () => null,
        },
    ];

    useEffect(() => {
        if (alert.level !== "calm") {
            message.open({
                type: 'error',
                content: (
                    <>
                        <b>{alert.message}</b>
                        <br/>
                        <div style={{maxWidth: 400}}>
                        {alert.description}
                        </div>
                    </>
                ),
                duration: 10
            });
        }
    }, [alert]);

    return (
        <div>
            <ModeSection>

                <div ref={tourView}>
                <SimplifiedViewImagesDisplay/>
                </div>
                <div ref={tourMode}>
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
                <div ref={tourPrompts}>
                    {prompt}
                </div>
                <div ref={tourGenerators}>
                    <ModeHeader>Generators</ModeHeader>
                    {generatorColumn}
                </div>
                <div ref={tourGenerate}>
                    {genButton}
                </div>
            </ModeSection>
            <Tour open={open} onClose={() => setOpen(false)} steps={steps} mask={{
                color: 'rgba(18, 23, 31, .95)',
            }}/>
            <FloatButton.Group shape="square" style={{ right: 24 }}>
                <FloatButton icon={<QuestionCircleOutlined />} type="primary" onClick={() => setOpen(true)} tooltip="Guided Tour"/>
                <FloatButton icon={<BankOutlined />} type="primary" tooltip="Learning Center" onClick={showModal}/>
                <FloatButton.BackTop visibilityHeight={0} type="primary" />
            </FloatButton.Group>
            <HelpModal
                visible={isModalOpen}
                onCancel={handleCancel}
                footer={null}
                destroyOnClose={true}
            >
                <LearningCenter/>
            </HelpModal>
        </div>
    );
};

export default SimplifiedView;