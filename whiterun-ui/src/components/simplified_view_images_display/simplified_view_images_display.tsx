import React, {useState} from 'react';
import {SettingOutlined} from "@ant-design/icons";
import {Modal} from "antd";
import {
    GeneratedCard,
    GeneratedCardDownload,
    GeneratedCardHeader,
    GeneratedContainerList
} from "./simplified_view_images_display_styles";
const SimplifiedViewImagesDisplay = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <GeneratedContainerList>
            <GeneratedCard>
                <GeneratedCardHeader>
                    <h1 style={{color: "white"}}>SDXL</h1>
                    <SettingOutlined style={{color: "white", fontSize: "24px"}}
                                     onClick={() => setIsModalOpen(true)}/>
                </GeneratedCardHeader>
                <div style={{borderTop: "1px solid white", marginBottom: "20px"}}/>
                <div style={{textAlign: "center"}}>
                    {/*<img src={TestImage} alt="Generated Image"*/}
                    {/*     style={{maxWidth: "300px", margin: "5px auto"}}></img>*/}
                    {/*<video src={TestVideo} style={{maxWidth: 300, margin: "5px auto"}}></video>*/}
                    <GeneratedCardDownload>Download</GeneratedCardDownload>
                </div>
                <Modal title="Settings Used for Generation" open={isModalOpen} footer={null}
                       onCancel={() => setIsModalOpen(false)}>
                </Modal>
            </GeneratedCard>

        </GeneratedContainerList>
    );
};

export default SimplifiedViewImagesDisplay