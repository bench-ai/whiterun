import {Card, Collapse, Layout, Spin} from 'antd';
import Paragraph from 'antd/es/typography/Paragraph';
import Title from 'antd/es/typography/Title';
import React, {useEffect, useState} from 'react';
import DragAndDrop from '../../testDnd/dnd';
import {TutorialCardList} from "./workbench.styles";

const {Panel} = Collapse;

const Workbench = () => {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        document.title = 'Workbench - Bench AI';
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
                            defaultActiveKey={[]}
                            size={"large"}
                            style={{background: "#0d1117", fontSize: "30px", fontWeight: "bold"}}

                        >
                            <Panel
                                header="Getting Started"
                                key="1"
                            >
                                <TutorialCardList>
                                    <Card bordered={false} hoverable={true}>
                                        <Title level={4} style={{marginTop: 0}}>1. Drag and Drop your Operators</Title>
                                        <Paragraph>While in the unlocked mode, use the left panel to drag the operators
                                            you want to use onto the board.</Paragraph>
                                    </Card>
                                    <Card bordered={false} hoverable={true}>
                                        <Title level={4} style={{marginTop: 0}}>2. Fill out your Operators and
                                            Connect</Title>
                                        <Paragraph>Begin filling out operators and connecting them together to make
                                            a workflow. While unlocked, you can save your workflows.</Paragraph>
                                    </Card>
                                    <Card bordered={false} hoverable={true}>
                                        <Title level={4} style={{marginTop: 0}}>3. Lock the Workflow and hit
                                            Play</Title>
                                        <Paragraph>Once your workflow is setup, hit the lock button. The bottom half of
                                            the operator opens up, allowing you to interact with the UI portion. Once
                                            ready, hit play to use
                                            your workflow.</Paragraph>
                                    </Card>
                                    <Card bordered={false} hoverable={true}>
                                        <Title level={4} style={{marginTop: 0}}>4. Need help or have feedback?</Title>
                                        <Paragraph>
                                            If you need assistance or have feedback, feel free to reach out:
                                            <ul style={{marginTop: "5px"}}>
                                                <li>
                                                    <a href="https://discord.gg/e7hkE656" target="_blank"
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
                                    <Card bordered={false} hoverable={true}>
                                        <Title level={4} style={{marginTop: 0}}>Alpha Notice</Title>
                                        <Paragraph>Currently, this software is in alpha phase so bugs and missing
                                            features are to be expected. Any feedback is greatly appreciated in helping us
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