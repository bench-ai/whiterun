import React, {FC, useEffect, useState} from 'react';
import {PictureOutlined, SettingOutlined} from "@ant-design/icons";
import {Carousel, Modal} from "antd";
import {GeneratedCard, GeneratedCardDownload, GeneratedCardHeader} from "./simplified_view_images_display_styles";

import {useSelector} from "react-redux";
import {RootState} from "../../../state/store";
import {Result} from "../../../state/results/resultSlice";
import styled from "styled-components";

interface display {
    name: string
    result?: Result
}


const VisualDisplay: FC<display> = ({name, result}) => {

    console.log("here")
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <GeneratedCard>
            <GeneratedCardHeader>
                <h1 style={{color: "white", textOverflow: "ellipsis"}}>{name}</h1>
                <SettingOutlined style={{color: "white", fontSize: "24px", marginLeft: "20px"}}
                                 onClick={() => setIsModalOpen(true)}/>
            </GeneratedCardHeader>
            <div style={{borderTop: "1px solid white", marginBottom: "20px"}}/>
            <div style={{textAlign: "center"}}>

                {!result && (<PictureOutlined
                    style={
                        {
                            fontSize: '250px',
                            color: "white"
                        }
                    }/>)
                }
                {result &&
                    (<img src={result.result}
                          alt="Generated Image"
                          style={{maxWidth: "300px", margin: "5px auto"}}>
                    </img>)
                }

                {/*<img src={TestImage} alt="Generated Image"*/}
                {/*     style={{maxWidth: "300px", margin: "5px auto"}}></img>*/}
                {/*<video src={TestVideo} style={{maxWidth: 300, margin: "5px auto"}}></video>*/}
                <GeneratedCardDownload>Download</GeneratedCardDownload>
            </div>
            <Modal title="Settings Used for Generation" open={isModalOpen} footer={null}
                   onCancel={() => setIsModalOpen(false)}>
            </Modal>
        </GeneratedCard>
    );
};


const SimplifiedViewImagesDisplay = () => {

    const generatorMap = useSelector((state: RootState) => state.generator.value);
    const mode = useSelector((state: RootState) => state.mode.value);
    const results = useSelector((state: RootState) => state.result.value)
    const [displayArr, setDisplayArr] = useState<display[]>([]);

    useEffect(() => {
        const tempDisplayArr: display[] = []

        console.log(results.resultArr)
        Object.keys(generatorMap).forEach(k => {
            tempDisplayArr.push({
                name: generatorMap[parseInt(k)].name
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
    }, [generatorMap, results.resultArr]);

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
            {displayArr.map((obj) => {
                console.log(obj); // Adding console log here
                return (
                    <VisualDisplay
                        name={obj.name}
                        result={obj.result}
                    />
                );
            })}
        </CarouselWrapper>
    );
};

export default SimplifiedViewImagesDisplay