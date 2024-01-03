import styled, {css} from 'styled-components';
import {Alert, Col, Form, Layout} from "antd";
import {Link} from 'react-router-dom';

const cursor = css`
    cursor: pointer;
    color: black;
`;

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


export const LoginContainer = styled.div`
    width: 450px;
    margin: auto;
    @media (max-width: 500px) {
        width: 350px;
    }
    text-align: center;
`;

export const LinkStyledLarge = styled(Link)`
    padding: 0 10px;
    text-decoration: none;
    font-size: 16px;

    ${cursor}
    :hover {
        color: #007AFF;
    }
`;

export const BackgroundGradient = styled(Col)`
    background: #141e30; /* fallback for old browsers */
    background: -webkit-linear-gradient(to right, #141e30, #243b55);
    background: linear-gradient(to right, #141e30, #243b55);
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center; /* Center text horizontally */
`;

export const LoginForm = styled(Form)`
    .ant-form-item {
        margin-bottom: 10px;
    }
    .ant-form-item-label {
        font-size: 16px;
        font-weight: bold;
    }
`;

export const AlertSmall = styled(Alert)`
    max-width: 350px;
    text-align: left;
    margin: auto;
    margin-bottom: 10px;
    @media (max-width: 500px) {
        width: 300px;
    }
`;

