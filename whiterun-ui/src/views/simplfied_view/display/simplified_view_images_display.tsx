import React, {FC, useEffect, useState} from 'react';
import {InfoCircleOutlined, LoadingOutlined, PictureOutlined} from "@ant-design/icons";
import {Carousel, Dropdown, Menu, Modal, Spin, Switch} from "antd";
import {
    DisabledError,
    DisabledPrompt,
    GeneratedCard,
    GeneratedCardDownload,
    GeneratedCardHeader
} from "./simplified_view_images_display_styles";

import {useSelector} from "react-redux";
import {RootState} from "../../../state/store";
import {Result} from "../../../state/results/resultSlice";

import styled from "styled-components";

interface display {
    name: string
    pending: boolean
    result?: Result
    index?: number
    func?: (num: number, state: boolean) => void
}

interface info {
    result: Result
}


const ModeSettings: FC<info> = ({result}) => {

    const menu = (
        <Menu>
            <Menu.Item>
                <div>
                     <pre style={{fontFamily: 'monospace'}}>
                         {JSON.stringify(result.settings, undefined, 2)}
                     </pre>
                </div>
            </Menu.Item>
        </Menu>
    );


    return (
        <div style={
            {
                maxHeight: '400px',
                overflowY: 'auto',
                backdropFilter: 'blur(5px)',
                backgroundColor: 'transparent'
            }}>
            <h1>Generation Info</h1>
            <h2>Error</h2>
            <DisabledError disabled={true}>
                {result.error ? result.error : "None"}
            </DisabledError>

            <h2>Prompt Settings</h2>

            <h3>Positive Prompt</h3>
            <DisabledPrompt disabled={true}>
                {result.positivePrompt}
            </DisabledPrompt>

            <h3>Negative Prompt</h3>
            <DisabledPrompt disabled={true}>
                {result.negativePrompt}
            </DisabledPrompt>

            <h2>Enhanced Prompt Settings</h2>

            <h3>Is Enhanced?</h3>
            <input
                disabled={true}
                value={result.enhanced ? "true" : "false"}
            />

            <h3>Prompt Style</h3>
            <input
                disabled={true}
                value={result.promptStyle ? result.promptStyle : "None"}
            />

            <h3>Enhanced Prompt</h3>
            <DisabledPrompt
                disabled={true}
                value={result.enhancedPrompt}
            />

            <Dropdown overlay={menu} trigger={['click']}>
                <a className="ant-dropdown-link" onClick={e => e.preventDefault()}>
                    <h2>Generator Settings</h2>
                </a>
            </Dropdown>
        </div>
    )
}


const VisualDisplay: FC<display> = (
    {
        name,
        pending,
        result,
        index,
        func
    }
) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const openLinkInNewTab = () => {
        if (result && result.result) {
            window.open(result.result, '_blank');
        }
    };

    console.log(result === undefined, index)

    return (
        <GeneratedCard>
            {(result) &&
                (<div style={{display: "flex", justifyContent: "flex-end", alignItems: "flex-start"}}>
                    <InfoCircleOutlined
                        style={{color: "white", fontSize: "40px"}}
                        onClick={() => setIsModalOpen(true)}
                    />
                </div>)
            }
            <GeneratedCardHeader>
                <h1 style={{color: "white", textOverflow: "ellipsis"}}>{name}</h1>
            </GeneratedCardHeader>
            <div style={{borderTop: "1px solid white", marginBottom: "20px"}}/>
            <div style={{textAlign: "center"}}>
                {(!result && !pending) && (<PictureOutlined
                    style={
                        {
                            fontSize: '250px',
                            color: "white"
                        }
                    }/>)
                }
                {(!result && pending) && (
                    <div style={
                        {
                            padding: 40
                        }
                    }>
                        <Spin
                            indicator={
                                <LoadingOutlined
                                    style={{
                                        fontSize: 250,
                                    }}
                                    spin
                                />
                            }/>
                    </div>
                )
                }
                {result &&
                    (<img src={result.result}
                          alt="Generated Image"
                          style={{maxWidth: "300px", margin: "5px auto"}}>
                    </img>)
                }

                {(result) &&
                    (<GeneratedCardDownload
                        onClick={openLinkInNewTab}
                    >
                        Download
                    </GeneratedCardDownload>)
                }
            </div>
            <Modal open={isModalOpen} footer={null}
                   onCancel={() => setIsModalOpen(false)}
                   style={{
                       maxHeight: '400px',
                   }}
            >
                {(result && result.result) &&
                    <ModeSettings
                        result={result}
                    />
                }
            </Modal>

            {(result && (index !== undefined) && func) &&

                (<div>
                <span
                    style={
                        {
                            marginRight: "15px",
                            fontSize: "15px",
                            fontWeight: "bold"
                        }
                    }
                >
                Select
                </span>
                        <Switch
                            defaultChecked={false}
                            onChange={(value) => {func(index, value)}}
                            style={{marginRight: '20px'}}/>
                    </div>)
            }
        </GeneratedCard>
    )
        ;
};


const SimplifiedViewImagesDisplay = () => {

    const generatorMap = useSelector((state: RootState) => state.generator.value);
    const results = useSelector((state: RootState) => state.result.value)
    const [displayArr, setDisplayArr] = useState<display[]>([]);
    const selectedArr = [false, false, false, false, false];

    useEffect(() => {
        const tempDisplayArr: display[] = []
        const pending = (results.pendingCount !== results.resultArr.length)

        Object.keys(generatorMap).forEach((k, index) => {
            tempDisplayArr.push({
                name: generatorMap[parseInt(k)].name,
                pending: pending,
            })
        })

        results.resultArr.forEach(result => {
            let completed = false
            tempDisplayArr.forEach(display => {
                if ((display.name === result.name) && !display.result && !completed) {
                    display.result = result
                    completed = true;
                }
            })
        })

        setDisplayArr(tempDisplayArr)

    }, [generatorMap, results.resultArr, results.pendingCount]);

    const updateSelected = (num: number, state: boolean) => {
        selectedArr[num] = state
    };

    const CarouselWrapper = styled(Carousel)`
 > .slick-dots li button {
    background: white;
  }
    > .slick-dots li.slick-active button {
    background: #39a047;
  }
`;

    return (
        <CarouselWrapper
            style={
                {
                    color: "white",
                }
            }
        >
            {displayArr.map((obj, index) => {
                console.log("Current Object:", obj); // Log obj here
                return (
                    <VisualDisplay
                        name={obj.name}
                        pending={obj.pending}
                        result={obj.result}
                        index = {index}
                        func = {updateSelected}
                    />
                );
            })}
        </CarouselWrapper>
    );
};

export default React.memo(SimplifiedViewImagesDisplay);