import React, {useEffect, useState} from 'react';
import {Link, Navigate, useNavigate} from "react-router-dom";
import axios from "axios";
import {Alert, Button, Col, Form, Input, Layout, Row, Typography} from "antd";
import {
    AlertContainer,
    BackgroundGradient,
    PasswordList,
    PasswordListFormat, RegisterForm,
    RequirementsContainer,
    SignUpContainer
} from "./register.styles";
import {
    CheckCircleOutlined,
    EmailOutlined,
    LockOutlined,
    PersonOutlined,
    UnpublishedOutlined
} from "@mui/icons-material";
import {PasswordRequirement, PasswordRequirementsValues} from "../../constants/components/auth.constants";
import BenchLogo from "../../assets/benchLogo.svg";
import BenchLogoBig from "../../assets/bench.svg";
import mixpanel from 'mixpanel-browser';

import Title from "antd/es/typography/Title";
import {useAuth} from "../../auth/auth_context";

const Register = () => {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [username, setUsername] = useState('');
    const baseURL = process.env.REACT_APP_DEV === 'true' ? `http://localhost:8080/api` : 'https://app.bench-ai.com/api';
    const [redirect, setRedirect] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [, setMessage] = useState('');
    const [error, setError] = useState(false);
    const [, setValidPassword] = useState(false);
    const { isLoggedIn } = useAuth();
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [fulfilledRequirements, setFulfilledRequirements] = useState<string[]>([]);

    const lengthRegex = /^.{10,60}$/;
    const lowercaseRegex = /[a-z]/;
    const uppercaseRegex = /[A-Z]/;
    const symbolRegex = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/;
    const numberRegex = /\d/;

    useEffect(() => {
        document.title = 'Create an Account - Bench AI';
        mixpanel.track("Register Page Viewed");
        if (isLoggedIn) {
            navigate('/');
        }
    },[isLoggedIn])

    const checkForm = (): boolean => {
        if (password !== confirmPassword) {
            setMessage("Passwords do not match");
            setError(true);
            setValidPassword(false);
            return false;
        }
        if (!lengthRegex.test(password)) {
            setMessage(PasswordRequirementsValues["LENGTH"]);
            setError(true);
            setValidPassword(false);
            return false;
        }
        if (!lowercaseRegex.test(password)) {
            setMessage(PasswordRequirementsValues["LOWER"]);
            setError(true);
            setValidPassword(false);
            return false;
        }
        if (!uppercaseRegex.test(password)) {
            setMessage(PasswordRequirementsValues["UPPER"]);
            setError(true);
            setValidPassword(false);
            return false;
        }

        if (!symbolRegex.test(password)) {
            setMessage(PasswordRequirementsValues["SPECIAL"]);
            setError(true);
            setValidPassword(false);
            return false;
        }

        if (!numberRegex.test(password)) {
            setMessage(PasswordRequirementsValues["NUMBER"]);
            setError(true);
            setValidPassword(false);
            return false;
        }

        form.resetFields();
        setValidPassword(true);
        return true;
    }

    const validatePassword = (_: any, value: string) => {
        const errors: string[] = [
            !lengthRegex.test(value) && PasswordRequirementsValues["LENGTH"],
            !lowercaseRegex.test(value) && PasswordRequirementsValues["LOWER"],
            !uppercaseRegex.test(value) && PasswordRequirementsValues["UPPER"],
            !symbolRegex.test(value) && PasswordRequirementsValues["SPECIAL"],
            !numberRegex.test(value) && PasswordRequirementsValues["NUMBER"],
        ].filter(Boolean) as string[];

        const keysOfRequirements = Object.keys(PasswordRequirementsValues) as PasswordRequirement[];

        setFulfilledRequirements(keysOfRequirements.filter((req) => !errors.includes(PasswordRequirementsValues[req])));

        if (errors.length > 0) {
            setValidPassword(false);
            return Promise.reject();
        } else {
            setValidPassword(true);
            return Promise.resolve();
        }
    };

    const submit = async () => {
        if (checkForm()) {
            try {
                await axios.post(`${baseURL}/auth/signup`, {
                    email,
                    password,
                    username,
                });
                mixpanel.track('Signed Up');
                mixpanel.identify(email);
                mixpanel.people.set({"$name": username, "$email": email} )

                setRedirect(true);
            } catch (error) {
                setErrorMessage('Failed to sign up. Please try again.');
                setError(true);
            }
        }
    };

    if (redirect) {
        return <Navigate to="/login"/>
    }

    return (
        <Layout>
            <Row justify="center" align="middle" style={{ minHeight: '100vh', width: '100%'}}>
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
                        <SignUpContainer>
                            <a href="https://www.bench-ai.com/" target="_blank" rel="noopener noreferrer">
                                <img width={50} src={BenchLogo} alt="Bench Logo"/>
                            </a>
                            <Title level={3} style={{marginBottom: '10px'}}>Register for an Account</Title>
                            <RegisterForm
                                name="signup_form"
                                initialValues={{remember: true}}
                                onFinish={submit}
                                layout={"vertical"}
                                requiredMark={false}
                            >
                                <Form.Item
                                    name="username"
                                    label="Username"
                                    rules={[{required: true, message: 'Username field is required'}]}
                                >
                                    <Input size="large" prefix={<PersonOutlined/>} placeholder="Enter a username"
                                           onChange={(e) => setUsername(e.target.value)}/>
                                </Form.Item>
                                <Form.Item
                                    name="email"
                                    label="Email"
                                    rules={[{required: true, message: 'Email field is required'}]}
                                >
                                    <Input prefix={<EmailOutlined/>} placeholder="Enter an Email" type="email"
                                           onChange={(e) => setEmail(e.target.value)}
                                           size="large"/>
                                </Form.Item>
                                <Form.Item
                                    name="password"
                                    label="Password"
                                    rules={[
                                        {required: true, message: 'Password field is required'},
                                        {validator: validatePassword}
                                    ]}
                                >
                                    <Input.Password size="large" prefix={<LockOutlined/>} placeholder="Enter password"
                                                    onChange={(e) => setPassword(e.target.value)}/>
                                </Form.Item>
                                <Form.Item
                                    name="confirmPassword"
                                    label="Confirm Password"
                                    rules={[{required: true, message: 'Confirming your password is required'}]}
                                >
                                    <Input.Password size="large" prefix={<LockOutlined/>} placeholder="Confirm your Password"
                                                    onChange={(e) => setConfirmPassword(e.target.value)}/>
                                </Form.Item>
                                <RequirementsContainer>
                                    <PasswordList>
                                        <b>A password must:</b>
                                        {(Object.keys(PasswordRequirementsValues) as PasswordRequirement[]).map((requirement, index) => (
                                            <PasswordListFormat key={index}>
                                                {fulfilledRequirements.includes(requirement) ? (
                                                    <React.Fragment>
                                                        <CheckCircleOutlined style={{color: 'green', marginRight: '8px'}}/>
                                                        <span>{PasswordRequirementsValues[requirement]}</span>
                                                    </React.Fragment>
                                                ) : (
                                                    <React.Fragment>
                                                        <UnpublishedOutlined style={{color: 'red', marginRight: '8px'}}/>
                                                        <span>{PasswordRequirementsValues[requirement]}</span>
                                                    </React.Fragment>
                                                )}
                                            </PasswordListFormat>
                                        ))}
                                    </PasswordList>
                                </RequirementsContainer>
                                <Form.Item>
                                    <Button type="primary" htmlType="submit" size="large" style={{width: '100%'}}>
                                        Sign Up
                                    </Button>
                                </Form.Item>
                            </RegisterForm>
                            <Typography.Paragraph>
                                Already have an account? <Link to="/login">Log in</Link>
                            </Typography.Paragraph>
                        </SignUpContainer>
                    </div>
                </Col>
                {/*Right section: Colored background with logo and text */}
                <BackgroundGradient xs={24} md={10}>
                    <div style={{ textAlign: 'left', padding: '40px', maxWidth: '500px'}}>
                        <img width={300} src={BenchLogoBig} alt="Bench Logo" />
                        <Title level={3}>You're one step closer to accessing the future of AI</Title>
                    </div>
                </BackgroundGradient>
            </Row>
        </Layout>
    );
};

export default Register;