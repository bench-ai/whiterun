import React from 'react';
import './App.css';
import {Route, Routes, useNavigate} from "react-router-dom";
import Login from "./views/login/login";
import Register from "./views/register/register";
import globalRouter from "./globalRouter";
import {ConfigProvider, theme} from "antd";
import Navbar from "./components/navbar/navbar";
import {AuthProvider} from "./auth/auth_context";
import Home from "./views/home/home";
import ErrorPage from "./views/error_page/error_page";
import Workbench from './views/workbench/workbench';
import SimplifiedView from "./views/simplfied_view/simplifiedview";
import ProtectedRoutes from "./components/protected_routes/protected_routes";

const App = () => {

    globalRouter.navigate = useNavigate();

    return (
        <>
            <ConfigProvider
                theme={{
                    components: {
                        Menu: {
                            itemBg: "#0d1117",
                            activeBarBorderWidth: 0
                        },
                    },
                    algorithm: theme.darkAlgorithm,
                    token: {
                        "colorPrimary": "#3fb950",
                        "colorBgBase": "#0d1117",
                        "colorBgContainer": "#12181f"
                    },


                }}
            >
                <AuthProvider>
                    <Navbar/>
                    <Routes>
                        {/*<Route element={<ProtectedRoutes/>}>*/}
                        {/*    <Route path={"/workbench/lite"} element={<SimplifiedView/>}/>*/}
                        {/*</Route>*/}
                        {/*<Route path={"/browse"} element={<AppPage/>}/>*/}
                        {/*<Route path={"/protected"} element={<Protected/>}/>*/}
                        <Route path="/workbench" element={<Workbench />} />
                        <Route path="/workbench/lite" element={<SimplifiedView />} />
                        <Route path={"/"} element={<Home/>}/>
                        <Route path={"/login"} element={<Login/>}/>
                        <Route path={"/register"} element={<Register/>}/>
                        <Route path={"/error"} element={<ErrorPage/>} />
                        <Route path="*" element={<ErrorPage />} />
                    </Routes>
                </AuthProvider>
            </ConfigProvider>
        </>
    );
}

export default App;
