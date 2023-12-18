import React from 'react';
import './App.css';
import {Route, Routes, useNavigate} from "react-router-dom";

import Login from "./views/login/login";
import Register from "./views/register/register";
import Home from "./views/home/home";
import {createTheme, ThemeProvider} from "@mui/material/styles";
import {CssBaseline} from "@mui/material";
import Protected from './views/protected/protected';
import globalRouter from "./globalRouter";
import AppPage from "./views/app_page/app_page";

const App = () => {

    globalRouter.navigate = useNavigate();

    const darkTheme = createTheme({
        palette: {
            mode: 'dark',
        },
    });

    return (
        <ThemeProvider theme={darkTheme}>
            <CssBaseline/>
                <Routes>
                    <Route path={"/protected"} element={<Protected/>}/>
                    <Route path={"/app"} element={<AppPage/>}/>
                    <Route path={"/"} element={<Home/>}/>
                    <Route path={"/login"} element={<Login/>}/>
                    <Route path={"/register"} element={<Register/>}/>
                </Routes>
        </ThemeProvider>

    );
}

export default App;
