import styled from 'styled-components';
import {Col, Form, Layout} from "antd";

export const Container = styled(Layout)`
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
`;

export const AlertContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 20px;
`;

export const SignUpContainer = styled.div`
    width: 450px;
    margin: auto;
    @media (max-width: 500px) {
        width: 350px;
    }
    text-align: center;
`;

export const RequirementsContainer = styled.div`
    width: 450px;
    margin: 15px 0 30px 0;
    text-align: left;
    font-size: 15px;
`;

export const PasswordList = styled.ul`
    list-style: none;
    padding-left: 0;
    align-items: center;
`;

export const PasswordListFormat = styled.li`
    display: flex;
    vertical-align: center;
    margin: 5px 0 5px 0;
`;

export const BackgroundGradient = styled(Col)`
    //background: #141e30; /* fallback for old browsers */
    //background: -webkit-linear-gradient(to right, #141e30, #243b55);
    background: linear-gradient(to right, rgb(15, 122, 60) 0%, rgb(1, 54, 23) 90%);

//background: radial-gradient(circle at -1% 57.5%, rgb(15, 122, 60) 0%, rgb(1, 54, 23) 90%);
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center; /* Center text horizontally */
`;

export const RegisterForm = styled(Form)`
    .ant-form-item {
        margin-bottom: 10px;
    }
    .ant-form-item-label {
        font-size: 16px;
        font-weight: bold;
    }
`;