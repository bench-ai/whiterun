import React from 'react';
import {Button} from "antd";
import {TutorialVideoModal} from "../../../views/workbench/workbench.styles";
import Title from "antd/es/typography/Title";
import DiscordLogo from "../../../assets/discordLogo.svg";
import ThumbnailSimplifiedWorkflows from "../../../assets/thumbnails/thumbnailSimplifiedWorkflows.png";
import {CenteredPlayButton, TutorialThumbnail, VideoCard} from "../tutorial_videos/tutorial_videos.styles";
import {PlayCircleFilled} from "@mui/icons-material";

const GettingStarted = () => {


    return (
        <div>
            <Title level={1} style={{marginTop: "0px", marginBottom: "5px"}}>Learn How to Make Your First
                Workflow</Title>
            <p style={{margin: "0 0 30px 0"}}>See how easy it is to get started with Bench AI</p>
            <TutorialVideoModal
                src="https://www.youtube.com/embed/BIsJ18lYyXU?si=mnS0xfsSFTK7iwUa"
                title="YouTube video player" frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen></TutorialVideoModal>

            <Title level={1} style={{marginTop: "40px", marginBottom: "5px"}}>Learn How to Use Our Simplified
                Workbench</Title>
            <p style={{margin: "0 0 30px 0"}}>See how easy it is to get started with Bench AI</p>
            <a
                href="https://drive.google.com/file/d/1tkaNCwy8vzVnw5LojiS7I2VSp0j-W-QE/view?usp=drive_link"
                target="_blank"
                rel="noopener noreferrer"
            >
                <VideoCard
                    hoverable
                    bordered={false}
                    style={{maxWidth: "1000px" ,position: "relative"}}
                >
                    <TutorialThumbnail
                        src={ThumbnailSimplifiedWorkflows}
                        alt="uh oh"
                    />
                    <CenteredPlayButton>
                        <PlayCircleFilled style={{fontSize: "60px"}}/>
                    </CenteredPlayButton>
                </VideoCard>
            </a>
            <Title level={4}>For additional Help:</Title>
            <a href="https://discord.com/invite/gt8HvMgUn5" target="_blank" rel="noopener noreferrer">
                <Button style={{
                    backgroundColor: '#404eed',
                    borderColor: '#404eed',
                    fontWeight: 'bold',
                    fontSize: '16px',
                    display: 'flex',
                    color: 'white',
                }}>
                    Discord
                    <img src={DiscordLogo} alt={"Discord Logo"} style={{marginLeft: '10px'}}/>
                </Button>
            </a>
        </div>
    );
}

export default GettingStarted;