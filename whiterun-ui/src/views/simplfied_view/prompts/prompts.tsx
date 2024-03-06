import React, {ChangeEvent, MutableRefObject, useRef, useState} from 'react';
import {Collapse, Switch, Dropdown, Menu} from 'antd';
import {ModeHeader} from "../simplifiedview.styles";
import {Enhancement, Prompt, Text} from "./prompts.styles";
import {useDispatch, useSelector} from "react-redux";
import {RootState} from "../../../state/store";
import {switchEnhance, changeStyle, updatePositivePrompt, updateNegativePrompt} from "../../../state/prompt/promptSlice"
const { Panel } = Collapse;

interface PromptsProps {
    refNegative: MutableRefObject<null>;
    enhanceTour: MutableRefObject<null>;
}

const Prompts: React.FC<PromptsProps> = ({ refNegative, enhanceTour }) => {

    const prompt = useSelector((state: RootState) => state.prompt.value);
    const dispatch = useDispatch();

    const handlePosChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
        dispatch(updatePositivePrompt(event.target.value))
    };

    const handleNegChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
        const text: string | undefined = event.target.value === "" ? undefined : event.target.value
        dispatch(updateNegativePrompt(text))
    };

    const onSelect = (selected: string) => {
        dispatch(changeStyle(selected))
    };

    const menu = (
        <Menu onClick={({ key }) => onSelect(key)}>
            <Menu.Item key="photorealistic">Photorealistic</Menu.Item>
            <Menu.Item key="oilpainting">Oil Painting</Menu.Item>
            <Menu.Item key="anime">Anime</Menu.Item>
            <Menu.Item key="fantasy">Fantasy</Menu.Item>
            <Menu.Item key="neonpunk">Neonpunk</Menu.Item>
        </Menu>
    );

    const onChange = () => {
        dispatch(switchEnhance())
    };

    return (
        <div>
            <ModeHeader>Prompts</ModeHeader>
            <Prompt
                onChange={handlePosChange}
                value={prompt.positivePrompt}
            />
            <div ref={refNegative}>
            <Collapse ghost>
                <Panel header="Negative Prompt" key="1">
                    <Prompt
                        onChange={handleNegChange}
                        value={prompt.negativePrompt}
                    ></Prompt>
                </Panel>
            </Collapse>
            </div>
            <Enhancement ref={enhanceTour}>
                <Text>Enhance Prompt</Text>
                <Switch defaultChecked={prompt.enhance} onChange={onChange} style={{ marginRight: '20px' }}/>
                {prompt.enhance && (
                    <Dropdown overlay={menu}>
                    <span
                        className="ant-dropdown-link"
                        onClick={e => e.preventDefault()}>
                        {prompt.promptStyle ? prompt.promptStyle : "Select a style"}
                    </span>
                    </Dropdown>
                )}
            </Enhancement>
        </div>
    );
};

export default Prompts;