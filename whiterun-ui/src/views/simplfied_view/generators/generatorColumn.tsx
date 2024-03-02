import React, {FC, useEffect, useState} from 'react';
import {Column, ModelDescription, ModelGrid, ModelHeader, ModelText, SelectedGrid} from "./generatorColumn.styles";
import {Card, Modal} from "antd";
import generators from "./json/generators.json"
import {PlusOutlined, MinusOutlined, SettingOutlined} from '@ant-design/icons';
import SettingModal from "./GeneratorSettings";
import {Option} from "../../../state/generator/generatorSlice";

import {useDispatch, useSelector} from "react-redux";
import {RootState} from "../../../state/store";
import {removeGenerator, addGenerator, updateGenerator, GeneratorOptionMap} from "../../../state/generator/generatorSlice"



interface Generator {
    name: string,
    difficulty: string,
    description: string,
    onClick: () => void
}

interface SelectedGenerator {
    name: string,
    settings: Option[],
    onClick: () => void
    id: number
}

interface Add {
    onClick: () => void
}

const GeneratorCard: FC<Generator> = ({
                                          description,
                                          difficulty,
                                          name,
                                          onClick
                                      }) => {

    const difficultySentence = `${difficulty}`

    let fontColor = 'white';

    if (difficulty === 'easy') {
        fontColor = 'green';
    } else if (difficulty === 'medium') {
        fontColor = 'orange';
    } else if (difficulty === 'hard') {
        fontColor = 'red';
    }

    return (
        <Card
            onClick={onClick}
            hoverable={true}
            bordered={false}
            style={{maxWidth: 400}}>
            <div>
                <ModelHeader style={{marginTop: -20, borderBottom: 1}}>{name}</ModelHeader>
                <div style={{display: "flex"}}>
                    <ModelText>Difficulty:&nbsp;</ModelText>
                    <ModelText style={{color: fontColor,}}>{difficultySentence}</ModelText>
                </div>
                <ModelDescription>{description}</ModelDescription>
            </div>
        </Card>
    );
};

const AddCard: FC<Add> = ({onClick}) => {

    return (
        <Card
            hoverable={true}
            bordered={false}
            onClick={onClick}
            style={{
                width: 200,
                background: "transparent",
                border: "2px solid white",
                display: "flex",
                justifyContent: "center", // Center horizontally
                alignItems: "center" // Center vertically
            }}>
            <div>
                <PlusOutlined style={{fontSize: '40px', color: 'white'}}/>
            </div>
        </Card>
    );
};


const SelectedGeneratorCard: FC<SelectedGenerator> = ({name, settings, onClick, id}) => {

    const [displayOptions, setDisplayOptions] =
        useState(false);

    const changeDisplayOptions = (mode: boolean) => {
        setDisplayOptions(mode)
    };

    return (
        <Card
            hoverable={true}
            bordered={false}
            style={{width: 200, background: "transparent", border: "2px solid white"}}>
            <div
                style={{
                    display: "flex",
                    justifyContent: "right",
                    alignItems: "right",
                }}>
                <SettingOutlined
                    style={{
                        fontSize: '20px',
                    }}
                    onClick={() => {
                        changeDisplayOptions(true);
                    }}/>
            </div>
            <div
                style={{
                    display: "flex",
                    justifyContent: "left",
                    alignItems: "left",
                }}>
                <MinusOutlined
                    style={{
                        fontSize: '20px',
                    }}
                    onClick={onClick}/>
            </div>
            <div>
                <h2 style={{
                    borderBottom: 1,
                    textAlign: "center",
                    margin: "0"
                }}>{name}</h2>
            </div>
                <Modal
                    title="Settings"
                    open={displayOptions}
                    onCancel={()=>changeDisplayOptions(false)}
                    footer={null} // Hide the footer
                >
                    {/* Content of your modal */}
                    <SettingModal data={settings} id={id}/>
                </Modal>
        </Card>
    );
};


const GeneratorColumn = () => {

    const generatorMap = useSelector((state: RootState) => state.generator.value);
    const mode = useSelector((state: RootState) => state.mode.value);
    const dispatch = useDispatch();
    const [displayOptions, setDisplayOptions] =
        useState(false);

    const generatorJson: GeneratorOptionMap = generators

    function handleWorkflowCard(name: string,
                                difficulty: string,
                                description: string,
                                settings: Option[]) {
        dispatch(
            addGenerator(
                {
                    name: name,
                    description: description,
                    difficulty: difficulty,
                    settings: settings
                }
            )
        )
    }

    const handleWorkflowCardClick = (dataObject: Object) => {
        const typedDataObject = dataObject as {
            name: string,
            settings: Option[],
            difficulty: string
            description: string,
        };

        handleWorkflowCard(
            typedDataObject["name"],
            typedDataObject["difficulty"],
            typedDataObject["description"],
            typedDataObject["settings"])
    };

    const changeDisplayOptions = (mode: boolean) => {
        setDisplayOptions(mode)
    };

    const handleSelectedClick = (id: number) => {
        dispatch(
            removeGenerator(id)
        )
    };

    useEffect(() => {

        if (generatorJson[mode.name].length > 1) {
            const typedDataObject = generatorJson[mode.name][0] as {
                name: string,
                settings: Option[],
                difficulty: string
                description: string
            };

            if (generatorMap.hasOwnProperty(0)) {
                if (generatorMap[0]["name"] === "none") {
                    dispatch(updateGenerator({
                        0: {
                            name: typedDataObject.name,
                            difficulty: typedDataObject.difficulty,
                            description: typedDataObject.description,
                            settings: typedDataObject.settings
                        }
                    }))
                }
            }
        }else{
            dispatch(removeGenerator(0))
        }
    }, [generatorMap]);

    return (
        <div>
            <SelectedGrid>
                {Object.keys(generatorMap).map((key) => {
                    return (<SelectedGeneratorCard
                        name={generatorMap[parseInt(key)].name}
                        onClick={() => handleSelectedClick(parseInt(key))}
                        settings={generatorMap[parseInt(key)].settings}
                        id={parseInt(key)}
                    />);
                })}
                <AddCard onClick={() => changeDisplayOptions(true)}/>
            </SelectedGrid>

            <Modal
                title={<h2 style={{fontSize: 35, margin: "0 0 0 25px"}}>Select your Generators</h2>}
                open={displayOptions}
                onCancel={() => changeDisplayOptions(false)}
                footer={null}
                style={{
                    minWidth: "75%",
                }}
                bodyStyle={{maxHeight: "600px"}}
            >
                <Column>
                    <div style={{
                        display: "flex",
                        justifyContent: "right",
                        alignItems: "right",
                        padding: "10px"
                    }}>
                    </div>
                    <ModelGrid>
                        {generatorJson[mode.name].map((obj) => (
                            <GeneratorCard
                                description={obj["description"]}
                                name={obj["name"]}
                                difficulty={obj["difficulty"]}
                                onClick={() => handleWorkflowCardClick(obj)}
                            />
                        ))}
                    </ModelGrid>
                </Column>
            </Modal>
        </div>
    );
};

export default GeneratorColumn;