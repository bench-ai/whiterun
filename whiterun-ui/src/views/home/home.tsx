import React, {useEffect, useState} from 'react';

import axios from "axios";
import Title from "antd/es/typography/Title";
import {Button, Form, Input, Layout, Modal} from 'antd';
import {Content} from "antd/es/layout/layout";
import {WorkflowList} from "./home.styles";
import {WorkflowCard} from "../../components/workflow_card/workflow_card";
import {AddApiForm} from "../app_page/app_page.styles";

interface Workflow {
    id: string;
    name: string;
}

const Home = () => {

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [name, setName] = useState('');
    const [workflows, setWorkflows] = useState<Record<string, Workflow> | null>(null);
    const [, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const port = process.env.REACT_APP_DEV === 'true' ? process.env.REACT_APP_D_BACKEND_PORT : process.env.REACT_APP_P_BACKEND_PORT;

    const showModal = () => {
        setIsModalOpen(true);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    useEffect(() => {
        (async () => {
            try {
                const response = await axios.get(
                    `http://localhost:${port}/api/user/details`, {
                        withCredentials: true,
                    }
                );

                const userData = response.data;
                setWorkflows(userData.work_flows);

            } catch (e) {
                console.log(e);
            }
        })();
    }, [port]);

    const submit = async () => {
        setLoading(true);
        try {
            await axios.post(
                `http://localhost:${port}/api/workflows/new`,
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
                    <div>
                        <Title style={{fontSize: '50px', marginBottom: '0'}}>Home</Title>
                        <hr style={{border: '2px solid #3FB950', borderRadius: '5px', width: '65%', marginLeft: '0'}}/>
                    </div>
                    <Title level={2} style={{marginBottom: '30px'}}>My Workflows</Title>
                    <Button type="primary" onClick={showModal} style={{marginBottom: "20px"}}>
                        Create WorkFlow
                    </Button>
                    <Modal
                        title={<Title level={3}>Create a Workflow</Title>}
                        visible={isModalOpen}
                        onCancel={handleCancel}
                        footer={null}
                        destroyOnClose={true}
                    >
                        <AddApiForm name="create_workflow_form"
                                    initialValues={{remember: false}}
                                    layout={"vertical"}
                                    requiredMark={false}
                                    onFinish={submit}
                        >
                            <Form.Item name="workflow_name"
                                       label="Workflow Name"
                                       rules={[{required: true, message: 'Please add a name for your workflow'}]}
                            >
                                <Input
                                    placeholder="Enter workflow name"
                                    onChange={(e) => setName(e.target.value)}
                                    size="large"
                                />
                            </Form.Item>
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