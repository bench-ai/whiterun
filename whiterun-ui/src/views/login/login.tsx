import React, {useEffect, useState} from 'react';
import {Link, useNavigate} from "react-router-dom";
import axios from "axios";
import {AlertContainer, LoginContainer, LoginForm} from './login.styles';
import {Button, Form, Input, Alert, Typography, Col, Row, Layout} from 'antd';
import {EmailOutlined, LockOutlined} from "@mui/icons-material";
import BenchLogo from "../../assets/benchLogo.svg";
import Title from "antd/es/typography/Title";
import {BackgroundGradient} from "../register/register.styles";
import BenchLogoBig from "../../assets/bench.svg";
import {useAuth} from "../../auth/auth_context";

const Login = () => {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [error, setError] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const baseURL = process.env.REACT_APP_DEV === 'true' ? `http://localhost:8080/api` : 'https://app.bench-ai.com/api';

    useEffect(() => {
        document.title = 'Sign In - Bench AI';
    })

    const submit = async () => {
        try {
            console.log(baseURL);
            const {data} = await axios.post(
                `${baseURL}/auth/login`,
                {
                    email,
                    password,
                },
                {withCredentials: true}
            );

            axios.defaults.headers.common['Authorization'] = `Bearer ${data['access']}`;
            login();
            navigate("/");
        } catch (error) {
            setErrorMessage('Failed to log in. Please check your credentials.');
            setError(true);
        }
    };

    return (

        <Layout style={{height: '100vh'}}>
            <Row justify="center" align="middle" style={{minHeight: '100vh', width: '100%'}}>
                {/*Left section: Register container */}
                <Col xs={24} md={14}>
                    <div>
                        <AlertContainer>
                        {
                            error &&
                            <Alert
                                message={errorMessage}
                                type="error"
                                showIcon
                                closable={true}
                                afterClose={() => setError(false)}
                                style={{width: '60%'}}
                            />
                        }
                        </AlertContainer>
                        <LoginContainer>
                            <a href="https://www.bench-ai.com/" target="_blank" rel="noopener noreferrer">
                                <img width={50} src={BenchLogo} alt="Bench Logo"/>
                            </a>
                            <Title level={3} style={{marginBottom: '10px'}}>Log in to your Account</Title>
                            <LoginForm name="login_form"
                                       initialValues={{remember: true}}
                                       onFinish={submit}
                                       layout={"vertical"}
                                       requiredMark={false}
                            >
                                <Form.Item name="email"
                                           label="Email"
                                           rules={[{required: true, message: 'Email field is required'}]}
                                >
                                    <Input prefix={<EmailOutlined/>} placeholder="Enter your email"
                                           onChange={(e) => setEmail(e.target.value)}
                                           size="large"
                                    />
                                </Form.Item>
                                <Form.Item name="password"
                                           label="Password"
                                           rules={[{required: true, message: 'Password field is required'}]}>
                                    <Input.Password
                                        prefix={<LockOutlined/>}
                                        placeholder="Enter your password"
                                        onChange={(e) => setPassword(e.target.value)}
                                        size="large"
                                    />
                                </Form.Item>
                                <Form.Item>
                                    <Button type="primary" htmlType="submit" size="large"
                                            style={{width: '100%', marginTop: '25px'}}>
                                        Login
                                    </Button>
                                </Form.Item>
                            </LoginForm>
                            <Typography.Paragraph>
                                New to Bench? <Link to="/register">Create an Account</Link>
                            </Typography.Paragraph>
                        </LoginContainer>
                    </div>
                </Col>
                {/*Right section: Colored background with logo and text */}
                <BackgroundGradient xs={24} md={10}>
                    <div style={{textAlign: 'left', padding: '40px', width: '500px'}}>
                        <img width={300} src={BenchLogoBig} alt="Bench Logo"/>
                        <Title level={3}>Welcome to Bench AI</Title>
                    </div>
                </BackgroundGradient>
            </Row>
        </Layout>
    );
};

export default Login;