import {Card, Collapse, Layout, Spin} from 'antd';
import Paragraph from 'antd/es/typography/Paragraph';
import Title from 'antd/es/typography/Title';
import React, {useEffect, useRef, useState} from 'react';
import DragAndDrop from '../../testDnd/dnd';
import {TutorialCardList, TutorialVideo} from "./workbench.styles";
// import mixpanel from "mixpanel-browser";

const {Panel} = Collapse;

const Workbench = () => {
    const [loading, setLoading] = useState(true);

    function parseUrl(){
        const queryString = window.location.search;
        const queryParams = new URLSearchParams(queryString);
        return queryParams.get('id')
    }

    useEffect(() => {
        document.title = 'Workbench - Bench AI';
        // mixpanel.track("Workflow Viewed", {'Workflow Name': parseUrl()});
    })

    useEffect(() => {
        const artificialLoadingTimeout = setTimeout(() => {
            setLoading(false);
        }, 1000);

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
                            defaultActiveKey={[1]}
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
                                    <Card bordered={false}>
                                        <Title level={4} style={{marginTop: 0}}>2. Drag and Drop your Operators</Title>
                                        <Paragraph>Use the left panel to drag the operators you want to use onto the
                                            canvas</Paragraph>
                                    </Card>
                                    <Card bordered={false}>
                                        <Title level={4} style={{marginTop: 0}}>3. Fill out your Operators and
                                            Connect</Title>
                                        <Paragraph>Begin filling out operators and connect them together to make a
                                            workflow. For workflows you own, hit the save icon at the top left of the canvas
                                            in order to save your progress.</Paragraph>
                                    </Card>
                                    <Card bordered={false}>
                                        <Title level={4} style={{marginTop: 0}}>4. Run your Workflow</Title>
                                        <Paragraph>A requirement for being able to run you workflow is that a display
                                            operator
                                            must be connected to it. Once ready, hit the play button at the top left of
                                            the canvas.
                                            The play button will disappear as the workflow is running. Certain workflows
                                            take
                                            up to 3 minutes to finish executing.</Paragraph>
                                    </Card>
                                    <Card bordered={false}>
                                        <Title level={4} style={{marginTop: 0}}>5. Example Workflows</Title>
                                        <Paragraph>
                                            To get an idea of the kind of workflows you can create, here's a list of workflows:
                                            <ul style={{marginTop: "5px"}}>
                                                <li>
                                                    <a href="https://app.bench-ai.com/workbench?id=f2a58b0e-bd5e-11ee-bcd5-429d37f5fddc"
                                                       target="_blank"
                                                       rel="noopener noreferrer">Upscaling a Text to Image Workflow using
                                                        Dall-E</a>
                                                </li>
                                                <li>
                                                    <a href="https://app.bench-ai.com/workbench?id=c6bfd926-be87-11ee-bcd5-429d37f5fddc"
                                                       target="_blank"
                                                       rel="noopener noreferrer">Simple Text to Image Workflow w/ Negative
                                                        Prompts using Stable Diffusion</a>
                                                </li>
                                                <li>
                                                    <a href="https://app.bench-ai.com/workbench?id=cbc0dcc8-be87-11ee-bcd5-429d37f5fddc"
                                                       target="_blank"
                                                       rel="noopener noreferrer">Image to Image Workflow Using Stable Diffusion</a>
                                                </li>
                                            </ul>
                                        </Paragraph>
                                    </Card>
                                    <Card bordered={false}>
                                        <Title level={4} style={{marginTop: 0}}>6. Need help or have feedback?</Title>
                                        <Paragraph>
                                        If you need assistance or have feedback, feel free to reach out:
                                            <ul style={{marginTop: "5px"}}>
                                                <li>
                                                    <a href="https://discord.gg/Jv9fUCy7" target="_blank"
                                                       rel="noopener noreferrer">Discord Server</a>
                                                </li>
                                                <li>
                                                    <a href="https://www.linkedin.com/company/bench-ai" target="_blank"
                                                       rel="noopener noreferrer">LinkedIn</a>
                                                </li>
                                                <li>
                                                    Email: <a
                                                    href="mailto:founders@bench-ai.com">founders@bench-ai.com</a>
                                                </li>
                                            </ul>
                                        </Paragraph>
                                    </Card>
                                    <Card bordered={false}>
                                        <Title level={4} style={{marginTop: 0}}>Alpha Notice</Title>
                                        <Paragraph>Currently, this software is in alpha phase so bugs and missing
                                            features are to be expected. Any feedback is greatly appreciated in helping
                                            us
                                            better your experience.

                                            Users get 10 requests per day, while not being logged in. To get unlimited
                                            requests simply login.
                                        </Paragraph>
                                    </Card>
                                </TutorialCardList>
                            </Panel>
                        </Collapse>
                    </div>
                    <DragAndDrop/>
                </div>
            </div>
        </Layout>
    );
};

export default Workbench;