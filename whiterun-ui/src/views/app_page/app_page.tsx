import React, {useEffect, useState} from 'react';
import axios from "axios";
import {Avatar, Button, Form, Input, Layout, Menu, Modal, Popover, Select} from 'antd';
import {Content} from 'antd/es/layout/layout';
import BenchLogo from "../../assets/bench.svg";
import SmallBenchLogo from '../../assets/benchLogo.svg';
import {LogoutOutlined, PersonOutlined} from "@mui/icons-material";
import {
    AddApiForm,
    ApiList,
    ButtonPopover,
    DividerPopover,
    HeaderStyle,
    PopoverContent,
    Profile
} from "./app_page.styles";
import {Navigate} from "react-router-dom";
import ApiCard from "../../components/api_card/api_card";
import Title from 'antd/es/typography/Title';

const AppPage = () => {

    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const [popoverVisible, setPopoverVisible] = useState(false);
    const [signOutLoading, setSignOutLoading] = useState(false);
    const [redirect, setRedirect] = useState(false);
    const baseURL = process.env.REACT_APP_DEV === 'true' ? `http://localhost:8080/api` : '';
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const onRequest = async () => {
        setSignOutLoading(true);
        try {
            await axios.post(`${baseURL}/api/auth/logout`, {}, {withCredentials: true,});

            setRedirect(true);
        } catch (error) {
            console.error('Error during logout:', error);
        }
        setSignOutLoading(false);
    }

    if (redirect) {
        return <Navigate to="/login"/>
    }

    const handlePopoverVisibleChange = (visible: boolean) => {
        setPopoverVisible(visible);
    };

    const handleProfileClick = () => {
        setPopoverVisible(false);
    };

    const showModal = () => {
        setIsModalOpen(true);
    };

    const handleOk = () => {
        setIsModalOpen(false);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    const isSmallScreen = windowWidth <= 768;

    return (
        <div>
            <Layout>
                <HeaderStyle>
                    <div style={{display: 'flex', alignItems: 'center',}}>
                        {isSmallScreen ? (
                            <img src={SmallBenchLogo} alt="Small Bench Logo" style={{width: '50px'}}/>
                        ) : (
                            <img src={BenchLogo} alt="Bench Logo" style={{width: '150px'}}/>
                        )}
                    </div>
                    <Menu
                        theme="dark"
                        mode="horizontal"
                        style={{flex: 1, minWidth: 0, margin: '0 25px 0 25px', backgroundColor: '#0d1117'}}
                    >
                        <Menu.Item
                            key="marketplace"
                            style={{fontSize: '14px', fontWeight: 'bold'}}
                        >
                            Browse APIs
                        </Menu.Item>
                        <Menu.Item
                            key="manage_api"
                            style={{fontSize: '14px', fontWeight: 'bold'}}
                        >
                            Manage my APIs
                        </Menu.Item>
                        <Menu.Item
                            key="add_api"
                            onClick={showModal}
                            style={{fontSize: '14px', fontWeight: 'bold', marginLeft: 'auto'}}
                        >
                            Add API
                        </Menu.Item>
                    </Menu>
                    <Modal
                        title={<Title level={3}>Add an API</Title>} okText={"Create project"}
                        open={isModalOpen} onOk={handleOk} onCancel={handleCancel} destroyOnClose={true}
                    >
                        <AddApiForm name="add_api_form"
                                   initialValues={{remember: false}}
                                   layout={"vertical"}
                                   requiredMark={false}
                        >
                            <Form.Item name="api_name"
                                       label="API Name"
                                       rules={[{required: true, message: 'Please add a name for your API'}]}
                            >
                                <Input
                                    placeholder="Enter your email"
                                       // onChange={(e) => setEmail(e.target.value)}
                                       size="large"
                                />
                            </Form.Item>
                            <Form.Item name="api_description"
                                       label="API Description"
                                       rules={[{required: true, message: 'Please add a description of your API'}]}>
                                <Input
                                    placeholder="Enter a description for your API"
                                    // onChange={(e) => setPassword(e.target.value)}
                                    size="large"
                                />
                            </Form.Item>
                            <Form.Item name="api_cateogry"
                                       label="Category"
                                       rules={[{required: true, message: 'Please select a category for your API'}]}>
                                <Select>
                                    <Select.Option value="LLM">LLM</Select.Option>
                                    <Select.Option value="CV">Computer Vision</Select.Option>
                                </Select>
                            </Form.Item>
                            <Form.Item name="api_price"
                                       label="API Price"
                                       rules={[{required: true, message: 'Please determine pricing for yoru API'}]}>
                                <Input
                                    placeholder="Enter a description for your project"
                                    // onChange={(e) => setPassword(e.target.value)}
                                    size="large"
                                />
                            </Form.Item>
                            <Form.Item>
                                <Button type="primary" htmlType="submit" size="large"
                                        style={{width: '100%', marginTop: '25px'}}>
                                    Create Project
                                </Button>
                            </Form.Item>
                        </AddApiForm>
                    </Modal>
                    <Popover placement="bottomRight" trigger="click" open={popoverVisible}
                             onOpenChange={handlePopoverVisibleChange} content={
                        <PopoverContent>
                            <div style={{textAlign: 'center'}}>
                                <Avatar size="large" style={{backgroundColor: '#87d068'}} icon={<PersonOutlined/>}/>
                                <h2>Cookie</h2>
                            </div>
                            <DividerPopover/>
                            <ButtonPopover type="text" size="large"
                                           onClick={handleProfileClick}><PersonOutlined style={{marginRight: '10px'}}/>
                                Profile
                            </ButtonPopover>
                            <DividerPopover/>
                            <ButtonPopover type="text" size="large" onClick={onRequest}
                                           loading={signOutLoading}><LogoutOutlined style={{marginRight: '10px'}}/>
                                Sign Out
                            </ButtonPopover>
                        </PopoverContent>
                    }
                    >
                        <Profile>
                            <Avatar size="large" style={{backgroundColor: '#87d068'}} icon={<PersonOutlined/>}/>
                        </Profile>
                    </Popover>
                </HeaderStyle>
                <Content style={{padding: '0 48px'}}>
                    <div>
                        <Title style={{fontSize: '50px', marginBottom: '0'}}>Marketplace</Title>
                        <hr style={{border: '2px solid #3FB950', borderRadius: '5px', width: '65%', marginLeft: '0'}}/>
                    </div>
                    <Title level={2} style={{marginBottom: '30px'}}>Trending APIs</Title>
                    <ApiList>
                        <ApiCard/>
                        <ApiCard/>
                        <ApiCard/>
                        <ApiCard/>
                        <ApiCard/>
                    </ApiList>
                    <Title level={2} style={{margin: '50px 0 30px 0'}}>Recently Added APIs</Title>
                    <ApiList>
                        <ApiCard/>
                        <ApiCard/>
                        <ApiCard/>
                        <ApiCard/>
                        <ApiCard/>
                    </ApiList>
                </Content>
            </Layout>
        </div>
    );
};

export default AppPage;