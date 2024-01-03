import React from 'react';
import './App.css';
import {Route, Routes, useNavigate} from "react-router-dom";
import Login from "./views/login/login";
import Register from "./views/register/register";
import Protected from './views/protected/protected';
import globalRouter from "./globalRouter";
import AppPage from "./views/app_page/app_page";
import {ConfigProvider, theme} from "antd";
import DragAndDrop from "./testDnd/dnd";

const App = () => {

    globalRouter.navigate = useNavigate();

    return (
        <div>
            <ConfigProvider
                theme={{
                    algorithm: theme.darkAlgorithm,
                    token: {
                        "colorBgBase": "#0d1117",
                        "colorBgContainer": "#12181f"
                    },
                }}
            >
                <Routes>
                    <Route path={"/protected"} element={<Protected/>}/>
                    <Route path={"/"} element={<DragAndDrop/>}/>
                    <Route path={"/browse"} element={<AppPage/>}/>
                    <Route path={"/login"} element={<Login/>}/>
                    <Route path={"/register"} element={<Register/>}/>
                </Routes>
            </ConfigProvider>
        </div>
    );
}

export default App;
