import React from 'react';
import {Button} from "antd";
import {TutorialVideoModal} from "../../../views/workbench/workbench.styles";
import Title from "antd/es/typography/Title";
import DiscordLogo from "../../../assets/discordLogo.svg";

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