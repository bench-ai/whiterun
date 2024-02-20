import {Button, Card, Collapse, Layout, Modal, Spin} from 'antd';
import Paragraph from 'antd/es/typography/Paragraph';
import Title from 'antd/es/typography/Title';
import React, {useEffect, useState} from 'react';
import DragAndDrop from '../../testDnd/dnd';
import {TutorialCardList, TutorialVideo, TutorialVideoModal} from "./workbench.styles";
import HelpLogo from "../../assets/helpLogo.svg";
import DiscordLogo from "../../assets/discordLogo.svg";
const {Panel} = Collapse;

const Workbench = () => {
    const [loading, setLoading] = useState(true);
    const [defaultActiveKey, setDefaultActiveKey] = useState(() => {
        return window.innerWidth < 768 ? ['0'] : ['1'];
    });
    const [isModalOpen, setIsModalOpen] = useState(false);

    const showModal = () => {
        setIsModalOpen(true);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    useEffect(() => {
        const handleResize = () => {
            // Set defaultActiveKey to '0' if the screen width is less than a certain value (e.g., 768 for mobile)
            setDefaultActiveKey(window.innerWidth < 768 ? ['0'] : ['1']);
        };

        // Initial setup
        handleResize();

        // Add resize event listener
        window.addEventListener('resize', handleResize);

        // Remove event listener on component unmount
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    function parseUrl(){
        const queryString = window.location.search;
        const queryParams = new URLSearchParams(queryString);
        return queryParams.get('id')
    }

    useEffect(() => {
        document.title = 'Workbench - Bench AI';
    })

    useEffect(() => {
        const artificialLoadingTimeout = setTimeout(() => {
            setLoading(false);
        }, 3000);

        return () => clearTimeout(artificialLoadingTimeout);
    }, []);

    return (
        <Layout>
            <div style={{position: 'relative', height: '100vh'}}>
                {loading && (
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <Spin/>
                    </div>
                )}
                <div style={{opacity: loading ? 0.0 : 1, pointerEvents: loading ? 'none' : 'auto'}}>
                    <div style={{margin: "0 20px"}}>
                        <Title>Workbench</Title>
                        <Collapse
                            bordered={false}
                            defaultActiveKey={defaultActiveKey}
                            size={"large"}
                            style={{background: "#0d1117", fontSize: "30px", fontWeight: "bold"}}
                        >
                            <Panel
                                header="Getting Started"
                                key="1"
                            >
                                <TutorialCardList>
                                    <Card bordered={false}>
                                        <Title level={4} style={{marginTop: 0}}>1. Learn to make your first
                                            workflow</Title>
                                        <TutorialVideo
                                                src="https://www.youtube.com/embed/BIsJ18lYyXU?si=mnS0xfsSFTK7iwUa"
                                                title="YouTube video player" frameBorder="0"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                                allowFullScreen></TutorialVideo>
                                    </Card>
                                    {/*<Card bordered={false}>*/}
                                    {/*    <Title level={4} style={{marginTop: 0}}>2. Example Workflows</Title>*/}
                                    {/*    <Paragraph>*/}
                                    {/*        To get an idea of the kind of workflows you can create, here's a list of workflows:*/}
                                    {/*        <ul style={{marginTop: "5px"}}>*/}
                                    {/*            <li>*/}
                                    {/*                <a href="https://app.bench-ai.com/workbench?id=f2a58b0e-bd5e-11ee-bcd5-429d37f5fddc"*/}
                                    {/*                   target="_blank"*/}
                                    {/*                   rel="noopener noreferrer">Upscaling a Text to Image Workflow using*/}
                                    {/*                    Dall-E</a>*/}
                                    {/*            </li>*/}
                                    {/*            <li>*/}
                                    {/*                <a href="https://app.bench-ai.com/workbench?id=c6bfd926-be87-11ee-bcd5-429d37f5fddc"*/}
                                    {/*                   target="_blank"*/}
                                    {/*                   rel="noopener noreferrer">Simple Text to Image Workflow w/ Negative*/}
                                    {/*                    Prompts using Stable Diffusion</a>*/}
                                    {/*            </li>*/}
                                    {/*            <li>*/}
                                    {/*                <a href="https://app.bench-ai.com/workbench?id=cbc0dcc8-be87-11ee-bcd5-429d37f5fddc"*/}
                                    {/*                   target="_blank"*/}
                                    {/*                   rel="noopener noreferrer">Image to Image Workflow Using Stable Diffusion</a>*/}
                                    {/*            </li>*/}
                                    {/*        </ul>*/}
                                    {/*    </Paragraph>*/}
                                    {/*    <Title level={4} style={{marginTop: 0}}>3. Need help or have feedback?</Title>*/}
                                    {/*    <Paragraph>*/}
                                    {/*        If you need assistance or have feedback, feel free to reach out:*/}
                                    {/*        <ul style={{marginTop: "5px"}}>*/}
                                    {/*            <li>*/}
                                    {/*                <a href="https://discord.com/invite/gt8HvMgUn5" target="_blank"*/}
                                    {/*                   rel="noopener noreferrer">Discord Server</a>*/}
                                    {/*            </li>*/}
                                    {/*            <li>*/}
                                    {/*                <a href="https://www.linkedin.com/company/bench-ai" target="_blank"*/}
                                    {/*                   rel="noopener noreferrer">LinkedIn</a>*/}
                                    {/*            </li>*/}
                                    {/*            <li>*/}
                                    {/*                Email: <a*/}
                                    {/*                href="mailto:founders@bench-ai.com">founders@bench-ai.com</a>*/}
                                    {/*            </li>*/}
                                    {/*        </ul>*/}
                                    {/*    </Paragraph>*/}
                                    {/*</Card>*/}
                                </TutorialCardList>
                            </Panel>
                        </Collapse>
                        <div>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                width: '100%'
                            }}>
                                <Button type="primary" onClick={showModal}
                                        style={{marginLeft: "auto", marginRight: "0"}}>
                                    <img src={HelpLogo} alt="Help Logo" style={{color: 'white'}}/>
                                </Button>
                            </div>
                            <Modal
                                title={<Title level={2}>Making a Workflow</Title>}
                                visible={isModalOpen}
                                onCancel={handleCancel}
                                footer={null}
                                destroyOnClose={true}
                                width={800}
                            >
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
                                        color: 'white',}}>
                                        Discord
                                        <img src={DiscordLogo} style={{marginLeft: '10px'}}/>
                                    </Button>
                                </a>
                            </Modal>
                        </div>
                    </div>
                    <DragAndDrop/>
                </div>
            </div>
        </Layout>
    );
};

export default Workbench;