import React, {useState} from 'react';
import GettingStarted from "./getting_started/getting_started";
import {Button, Layout, Menu, MenuProps} from "antd";
import {
    FlagOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    UnorderedListOutlined,
    YoutubeOutlined
} from "@ant-design/icons";
import Sider from "antd/es/layout/Sider";
import {Header} from "antd/es/layout/layout";
import Title from "antd/es/typography/Title";
import TutorialVideos from "./tutorial_videos/tutorial_videos";
import Changelog from './changelog/changelog';
import {LearningLayout, SiderDivider} from "./learning_center_styles";

const LearningCenter = () => {

    type MenuItem = Required<MenuProps>['items'][number];
    const [selectedMenuItem, setSelectedMenuItem] = useState('1');
    const [collapsed, setCollapsed] = useState(false);

    const getItem = (
        label: React.ReactNode,
        key: React.Key,
        icon?: React.ReactNode,
        children?: MenuItem[],
    ): MenuItem => {
        return {
            key,
            icon,
            children,
            label,
        } as MenuItem;
    }

    const items: MenuItem[] = [
        getItem('Getting Started', '1', <FlagOutlined/>),
        getItem('Tutorial Videos', '2', <YoutubeOutlined/>),
        getItem('Changelog', '3', <UnorderedListOutlined/>),
    ];

    let content;
    switch (selectedMenuItem) {
        case '1':
            content = <GettingStarted/>
            break;
        case '2':
            content = <TutorialVideos/>
            break;
        case'3':
            content = <Changelog/>
            break;
        default:
            content = "";
            break;
    }

    const handleMenuClick = (item: MenuItem) => {
        // @ts-ignore
        setSelectedMenuItem(item.key);
    };

    return (
        <Layout style={{minHeight: "80vh"}}>
            <Sider
                breakpoint="lg"
                trigger={null}
                collapsible
                collapsed={collapsed}
                onCollapse={setCollapsed}
                style={{backgroundColor: "#0d1117", padding: "10px"}}
            >
                <Title level={4} style={{display: "flex", justifyContent: "center"}}>
                    {collapsed ? '' : 'Learning Center'}
                </Title>
                <Menu mode="inline" defaultSelectedKeys={[selectedMenuItem]} items={items} onClick={handleMenuClick}
                      style={{fontSize: "15px", height: "80%"}}/>
            </Sider>
            <SiderDivider/>
            <Layout>
                <Header style={{paddingLeft: "0", backgroundColor: "#0d1117"}}>
                    <Button
                        type="text"
                        icon={collapsed ? <MenuUnfoldOutlined/> : <MenuFoldOutlined/>}
                        onClick={() => setCollapsed(!collapsed)}
                        style={{
                            fontSize: '16px',
                            width: 64,
                            height: 64,
                        }}/>
                </Header>
                <LearningLayout>
                    {content}
                </LearningLayout>
            </Layout>
        </Layout>

    );
}

export default LearningCenter;