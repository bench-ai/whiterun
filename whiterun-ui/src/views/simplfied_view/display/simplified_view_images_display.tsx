import React, {FC, useEffect, useState} from 'react';
import {InfoCircleOutlined, LoadingOutlined, PictureOutlined} from "@ant-design/icons";
import {Carousel, Dropdown, Menu, Modal, Spin, Switch} from "antd";
import {
    ContinueButton,
    DisabledError,
    DisabledPrompt,
    GeneratedCard,
    GeneratedCardDownload,
    GeneratedCardHeader,
    Header2
} from "./simplified_view_images_display_styles";
import {useDispatch, useSelector} from "react-redux";
import {RootState} from "../../../state/store";
import {Result} from "../../../state/results/resultSlice";
import styled from "styled-components";
import {downloadImage} from "../generate/requests/uploadImage";
import modeJson from "./display.json"
import {change} from "../../../state/mode/modeSlice"
import {resetAlert, updateAlert} from "../../../state/alerts/alertsSlice"
import {WarningAmberOutlined} from "@mui/icons-material";

interface display {
    name: string
    pending: boolean
    result?: Result
    index?: number
    func?: (num: number, state: boolean) => void
}

interface Alter {
    func: (str: string) => void
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

    const [imageListData, setImageListData] = useState<string[]>([]);
    const [maskData, setMask] = useState<string[]>([]);


    useEffect(() => {
        const fetchImageList = async () => {
            if (!result.image) {
                setImageListData([]);
            } else {
                const data = await imageList(result.image)
                setImageListData(data);
            }

            if (!result.mask) {
                setMask([]);
            } else {
                const data = await imageList([result.mask])
                setMask(data);
            }
        };

        fetchImageList();
    }, [result]);

    const imageList = async (imageList: string[]): Promise<string[]> => {

        const retData: string[] = []
        const data = imageList.map(async (image) => {
            return downloadImage(image)
        })
        for (const prom of data) {
            const up = await prom
            if (up.success) {
                retData.push(up.response ? up.response : "")
            } else {
                retData.push(up.error ? up.error : "")
            }
        }
        return retData
    }

    return (
        <div style={
            {
                maxHeight: '400px',
                overflowY: 'auto',
                backdropFilter: 'blur(5px)',
                backgroundColor: 'transparent'
            }}>
            <h1>Generation Info</h1>

            <Header2>Base Image</Header2>
            {(imageListData.length > 0) &&
                <div>
                    {imageListData.map((obj) => {
                        return (
                            <img
                                src={obj}
                                alt={"referenceImage"}
                                style={{maxWidth: '80%', maxHeight: '80%', width: 'auto', height: 'auto'}}
                            />
                        );
                    })}
                </div>
            }
            {(imageListData.length == 0) &&
                <input
                    disabled={true}
                    value={"None"}
                />
            }

            <Header2>Mask</Header2>
            {(maskData.length > 0) &&
                <div>
                    {maskData.map((obj) => {
                        return (
                            <img
                                src={obj}
                                alt={"referenceImage"}
                                style={{maxWidth: '80%', maxHeight: '80%', width: 'auto', height: 'auto'}}
                            />
                        );
                    })}
                </div>
            }

            {(maskData.length == 0) &&
                <input
                    disabled={true}
                    value={"None"}
                />
            }

            <Header2>Error</Header2>
            <DisabledError disabled={true}>
                {result.error ? result.error : "None"}
            </DisabledError>

            <Header2>Prompt Settings</Header2>

            <h3>Positive Prompt</h3>
            <DisabledPrompt disabled={true}>
                {result.positivePrompt}
            </DisabledPrompt>

            <h3>Negative Prompt</h3>
            <DisabledPrompt disabled={true}>
                {result.negativePrompt}
            </DisabledPrompt>

            <Header2>Enhanced Prompt Settings</Header2>

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
    const mode = useSelector((state: RootState) => state.mode.value)

    const openLinkInNewTab = () => {
        if (result && result.result) {
            window.open(result.result, '_blank');
        }
    };

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
                {(result?.result && (mode.name !== "anm")) &&
                    (<img src={result.result}
                          alt="Generated Image"
                          style={{maxWidth: "300px", margin: "5px auto"}}>
                    </img>)
                }
                {(result?.result && mode.name === "anm") && (
                    <video controls style={{ maxWidth: "80%", height: "auto" }}>
                        <source src={result.result} type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>
                )}
                {(result?.error) && (<WarningAmberOutlined
                    style={
                        {
                            fontSize: '250px',
                            color: "white"
                        }
                    }/>)
                }
                {(result?.result) &&
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
                {(result) &&
                    <ModeSettings
                        result={result}
                    />
                }
            </Modal>

            {(result?.result && (index !== undefined) && func) &&

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
                        onChange={(value) => {
                            func(index, value)
                        }}
                        style={{marginRight: '20px'}}/>
                </div>)
            }
        </GeneratedCard>
    )
        ;
};

const Continue: FC<Alter> = ({func}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const modeButtonList: { [key: string]: string[] } = modeJson;
    const mode = useSelector((state: RootState) => state.mode.value)

    return (
        <div>
            <ContinueButton
                onClick={() => setIsModalOpen(true)}
                style={{
                    marginTop:"40px"
                }}
            >
                Continue
            </ContinueButton>

            <Modal open={isModalOpen} footer={null}
                   onCancel={() => setIsModalOpen(false)}
                   style={{
                       maxHeight: '400px',
                   }}
            >
                {
                    modeButtonList[mode.name].map((obj) => {
                        return (
                            <button
                                onClick={() => {
                                    func(obj)
                                    setIsModalOpen(false)
                                }}
                            >
                                {obj}
                            </button>
                        );
                    })
                }
            </Modal>
        </div>);
}


const SimplifiedViewImagesDisplay = () => {

    const generatorMap = useSelector((state: RootState) => state.generator.value);
    const results = useSelector((state: RootState) => state.result.value)
    const mode = useSelector((state: RootState) => state.mode.value)
    const [displayArr, setDisplayArr] = useState<display[]>([]);
    const selectedArr = [false, false, false, false, false];
    const dispatch = useDispatch();

    useEffect(() => {
        const tempDisplayArr: display[] = []
        const pending = (results.pendingCount !== results.resultArr.length)

        if ((mode.image.length > 1) && (Object.keys(generatorMap).length == 1)){
            const firstGen = parseInt(Object.keys(generatorMap)[0])
            mode.image.forEach((_) => {
                tempDisplayArr.push({
                    name: generatorMap[firstGen].name,
                    pending: pending,
                })
            })
        }else if (Object.keys(generatorMap).length > 0){
            Object.keys(generatorMap).forEach((k) => {
                tempDisplayArr.push({
                    name: generatorMap[parseInt(k)].name,
                    pending: pending,
                })
            })
        }

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

    }, [generatorMap, results.resultArr, results.pendingCount, mode.image]);

    const updateSelected = (num: number, state: boolean) => {
        selectedArr[num] = state
    };

    const transfer = (value: string) => {

        dispatch(resetAlert())
        if(!selectedStatus()){

            console.log("here")
            dispatch(updateAlert({
                message: "Please Select Images",
                description: "Images must be selected before continuing. Hit the select switch" +
                    " on the images you like",
                level: "error"
            }))
        }else{
            const dataList: string[] = []

            selectedArr.forEach((obj, index) => {
                if (obj) {
                    const result = results.resultArr[index].result
                    if (result) {
                        const strArr = result.split("amazonaws.com/")
                        const fileName = strArr[1].split("?")[0]
                        dataList.push(fileName)
                    }
                }
            })

            dispatch(change({
                    name: value,
                    image: dataList,
                }
            ))
        }
    }

    const selectedStatus = () => {

        let status = false
        selectedArr.forEach((sel) => {
            if(sel){
                status = sel
            }
        })

        return status
    }

    const CarouselWrapper = styled(Carousel)`
 > .slick-dots li button {
    background: white;
  }
    > .slick-dots li.slick-active button {
    background: #39a047;
  }
`;

    return (
        <div>
            <CarouselWrapper
                style={
                    {
                        color: "white",
                    }
                }
            >
                {displayArr.map((obj, index) => {
                    return (
                        <VisualDisplay
                            name={obj.name}
                            pending={obj.pending}
                            result={obj.result}
                            index={index}
                            func={updateSelected}
                        />
                    );
                })}
            </CarouselWrapper>

            {((results.pendingCount === results.resultArr.length) && (results.resultArr.length > 0) && Object.keys(generatorMap).length > 0) &&
                (<Continue
                    func={transfer}
                />)
            }
        </div>
    );
};

export default React.memo(SimplifiedViewImagesDisplay);