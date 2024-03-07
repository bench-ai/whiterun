import React, {useEffect, useState} from 'react';

import axios from "axios";
import Title from "antd/es/typography/Title";
import {Alert, Button, Form, Input, Layout, Modal} from 'antd';
import {Content} from "antd/es/layout/layout";
import {WorkflowList} from "./home.styles";
import {WorkflowCard} from "../../components/workflow_card/workflow_card";
import {AddApiForm} from "../app_page/app_page.styles";

interface Workflow {
    id: string;
    name: string;
}

const cardData = [
    {id: 1, title: 'Stable Diffusion', category: 'Text to Image'},
    {id: 2, title: 'Dall-E', category: 'Text to Image'},
    {id: 3, title: 'Realistic', category: 'Text to Image'},
    {id: 4, title: 'Local Image', category: 'Image to Image'},
    {id: 5, title: 'Stable Diffusion', category: 'Image to Image'},
    {id: 6, title: 'Dall-E', category: 'Image to Image'},
    {id: 7, title: 'Realistic', category: 'Image to Image'},
    {id: 8, title: 'Stable Diffusion', category: 'Inpainting'},
];

const Home = () => {

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [name, setName] = useState('');
    const [workflows, setWorkflows] = useState<Record<string, Workflow> | null>(null);
    const [, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const baseURL = process.env.REACT_APP_DEV === 'true' ? `http://localhost:8080/api` : 'https://app.bench-ai.com/api';

    const showModal = () => {
        setIsModalOpen(true);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    useEffect(() => {
        document.title = 'Home - Bench AI';
    })

    useEffect(() => {
        (async () => {
            try {
                const response = await axios.get(
                    `${baseURL}/user/details`, {
                        withCredentials: true,
                    }
                );

                const userData = response.data;
                setWorkflows(userData.work_flows);

            } catch (e) {
                console.log(e);
            }
        })();
    }, [baseURL]);

    const submit = async () => {
        setLoading(true);
        try {
            await axios.post(
                `${baseURL}/workflows/new`,
                {
                    name,
                },
                {withCredentials: true}
            );

        } catch (error) {
            setErrorMessage('Failed to Create Workflow');
        }
        setLoading(false);
        window.location.reload();
    };

    return (
        <div>
            <Layout style={{height: "100vh"}}>
                <Content style={{padding: "0 48px"}}>
                    <Alert
                        message={<strong>An update to your Workflows</strong>}
                        description="We recently updated how workflows work and therefore, previous workflows no longer work and will have to be
                        recreated. We apologize for any inconvenience this has caused."
                        type="info"
                        closable
                        showIcon
                        style={{marginTop: "20px"}}
                    />
                    <div>
                        <Title style={{fontSize: '50px', marginBottom: '0'}}>Home</Title>
                        <hr style={{border: '2px solid #3FB950', borderRadius: '5px', width: '65%', marginLeft: '0'}}/>
                    </div>
                    <Title level={2} style={{marginBottom: '30px'}}>My Workflows</Title>
                    <Button type="primary" onClick={showModal} style={{marginBottom: "20px"}}>
                        Create WorkFlow
                    </Button>
                    <Modal
                        title={<Title level={2}>Create a Workflow</Title>}
                        visible={isModalOpen}
                        onCancel={handleCancel}
                        footer={null}
                        destroyOnClose={true}
                        width={800}
                    >
                        <AddApiForm name="create_workflow_form"
                                    initialValues={{remember: false}}
                                    layout={"vertical"}
                                    requiredMark={false}
                                    onFinish={submit}
                        >
                            <Form.Item name="workflow_name"
                                       label={<Title level={3} style={{marginBottom: '0'}}>Workflow Name:</Title>}
                                       rules={[{required: true, message: 'Please add a name for your workflow'}]}
                            >
                                <Input
                                    placeholder="Enter workflow name"
                                    onChange={(e) => setName(e.target.value)}
                                    size="large"
                                />
                            </Form.Item>
                            {/*<Title level={3} style={{marginBottom: '10px', marginTop: '50px'}}>Get started easily with a*/}
                            {/*    template</Title>*/}
                            {/*<hr style={{*/}
                            {/*    border: '2px solid #3FB950',*/}
                            {/*    borderRadius: '5px',*/}
                            {/*    width: '75%',*/}
                            {/*    marginLeft: '0'*/}
                            {/*}}/>*/}
                            {/*<CardSelector cardData={cardData}/>*/}
                            <Form.Item>
                                <Button type="primary" htmlType="submit" size="large" loading={loading}
                                        style={{width: '100%', marginTop: '25px'}}>
                                    Create Workflow
                                </Button>
                            </Form.Item>
                        </AddApiForm>
                    </Modal>
                    <WorkflowList>

                        {workflows &&
                            Object.keys(workflows).map((workflowId) => (
                                <WorkflowCard key={workflowId} id={workflowId} name={workflows[workflowId].name}/>
                            ))}

                    </WorkflowList>
                </Content>
            </Layout>
        </div>
    );
}

export default Home;