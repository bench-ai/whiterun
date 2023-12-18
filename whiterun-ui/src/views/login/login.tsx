import React, {SyntheticEvent, useState} from 'react';
import {
    Box,
    Button,
    Card,
    Link,
    Stack,
    TextField,
    Typography
} from "@mui/material";
import {Navigate, Link as RouterLink} from "react-router-dom";
import axios from "axios";

const Login = () => {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const port = process.env.REACT_APP_DEV === 'true' ? process.env.REACT_APP_D_BACKEND_PORT : process.env.REACT_APP_P_BACKEND_PORT;
    const [redirect, setRedirect] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const submit = async (e: SyntheticEvent) => {
        e.preventDefault();
        console.log(port);

        const {data} = await axios.post(`http://localhost:${port}/api/auth/login`, {
            email, password
        }, {withCredentials: true,});

        axios.defaults.headers.common['Authorization'] = `Bearer ${data['access']}`;
        setRedirect(true);
    }

    if (redirect) {
        return <Navigate to="/protected"/>
    }

    return (
        <Box
            sx={{
                flex: '1 1 auto',
                alignItems: 'center',
                display: 'flex',
                justifyContent: 'center',
                height: '100vh'
            }}
        >
            <Card
                sx={{
                    maxWidth: 550,
                    px: 5,
                    py: '100px',
                    width: '100%',
                    boxShadow: 3
                }}
            >
                <div>
                    <Stack
                        spacing={1}
                        sx={{mb: 3}}
                    >
                        <Typography variant="h4">
                            Login
                        </Typography>
                        <Typography
                            color="text.secondary"
                            variant="body2"
                        >
                            Don't have an account?
                            &nbsp;
                            <Link
                                component={RouterLink}
                                to="/register"
                                underline="hover"
                                variant="subtitle2"
                            >
                                Register
                            </Link>
                        </Typography>
                    </Stack>
                    <form onSubmit={submit}>
                        <Stack spacing={3}>
                            <TextField
                                label="Email Address"
                                onChange={e => setEmail(e.target.value)}
                            />
                            <TextField
                                label="Password"
                                type="password"
                                onChange={e => setPassword(e.target.value)}
                            />
                            {errorMessage && (
                                <Typography color="error">
                                    {errorMessage}
                                </Typography>
                            )}
                        </Stack>
                        <Button
                            fullWidth
                            size="large"
                            sx={{mt: 3}}
                            type="submit"
                            variant="contained"
                        >
                            Login
                        </Button>
                    </form>
                </div>
            </Card>
        </Box>
    );
};

export default Login;