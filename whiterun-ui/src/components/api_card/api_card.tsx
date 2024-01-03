import React from 'react';
import {Avatar, Card, Divider} from "antd";
import {MovieFilterOutlined, PaidOutlined, PersonOutlined} from "@mui/icons-material";
import {ApiCardDescription, ApiCardTitle} from "./api_card.styles";

const ApiCard = () => {

    return (
        <Card hoverable={true} bordered={false} style={{maxWidth: 500}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <ApiCardTitle>Word
                    to Movie Converter</ApiCardTitle>
                <MovieFilterOutlined fontSize="large"/>
            </div>
            <ApiCardDescription>Uses video diffusion to turn your words into movies</ApiCardDescription>
            <Divider style={{margin: '48px 0 12px 0'}}/>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '35px'}}>
                <div style={{display: 'flex', margin: "auto"}}>
                    <Avatar size="small" style={{backgroundColor: '#87d068'}} icon={<PersonOutlined/>}/>
                    <h3 style={{color: '#1DE8E8', margin: '0 10px'}}>Turbintube</h3>
                </div>
                <Divider type={"vertical"} style={{height: '100%'}}/>
                <div style={{display: 'flex', margin: "auto"}}>
                    <h4 style={{margin: '0 10px'}}>1 Token / Request</h4>
                    <PaidOutlined fontSize="medium" sx={{color:"#26A048"}}/>
                </div>
            </div>
        </Card>
    );
};

export default ApiCard;