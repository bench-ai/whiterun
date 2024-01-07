import React from 'react';
import { Route, Navigate, Outlet } from 'react-router-dom';
import {useAuth} from "../../auth/auth_context";

const ProtectedRoutes = () => {
    const { isLoggedIn } = useAuth();
    console.log(isLoggedIn);

    return isLoggedIn ? <Outlet /> : <Navigate to="/login" />;
};

export default ProtectedRoutes;
