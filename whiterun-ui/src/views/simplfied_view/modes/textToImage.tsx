import React from 'react';
import {Collapse, Switch, Dropdown, Menu} from 'antd';
import {ModeHeader} from "../simplifiedview.styles";
import {Enhancement, Prompt, Text} from "./textToImage.styles";
const { Panel } = Collapse;

const TextToImage = () => {

    const [checked, setChecked] = React.useState(false);
    const [selectedValue, setSelectedValue] = React.useState("Select an option");

    const onSelect = (selected: any) => {
        setSelectedValue(selected.key)
    };

    const menu = (
        <Menu onClick={onSelect}>
            <Menu.Item key="Photorealistic">Photorealistic</Menu.Item>
            <Menu.Item key="Oil Painting">Oil Painting</Menu.Item>
            <Menu.Item key="Anime">Anime</Menu.Item>
            <Menu.Item key="Fantasy">Fantasy</Menu.Item>
            <Menu.Item key="Neonpunk">Neonpunk</Menu.Item>
        </Menu>
    );

    const onChange = (checked: boolean) => {
        console.log(`switch to ${checked}`);
        setChecked(checked);
    };

    return (
        <div>
            <ModeHeader>Prompts</ModeHeader>
            <Prompt>Enter a positive prompt here!</Prompt>
            <Collapse ghost>
                <Panel header="Negative Prompt" key="1">
                    <Prompt></Prompt>
                </Panel>
            </Collapse>
            <Enhancement>
                <Text>Enhance Prompt</Text>
                <Switch defaultChecked={false} onChange={onChange} style={{ marginRight: '20px' }}/>
                {checked && (
                    <Dropdown overlay={menu}>
                    <span className="ant-dropdown-link" onClick={e => e.preventDefault()}>
                        {selectedValue}
                    </span>
                    </Dropdown>
                )}
            </Enhancement>
        </div>
    );
};

export default TextToImage;