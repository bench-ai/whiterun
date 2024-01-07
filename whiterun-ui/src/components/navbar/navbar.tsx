import React, {useState} from 'react';
import BenchLogo from "../../assets/bench.svg";
import axios from "axios";
import {useNavigate} from "react-router-dom";
import {Header, LeftOptions, RightOptions, StyledButton, StyledLink} from "./navbar.styles";
import {useAuth} from "../../auth/auth_context";

const NavbarGlobal = () => {

    return (
        <Header>
            <LeftOptions>
                <StyledLink to="/login">
                    <img src={BenchLogo} alt="Bench Logo" style={{width: '150px'}}/>
                </StyledLink>
            </LeftOptions>
            <RightOptions>
                <StyledLink to="/login">
                    <StyledButton type="text" size="large">Sign In
                    </StyledButton>
                </StyledLink>
                <StyledLink to="register">
                    <StyledButton type="primary" size="large">Sign Up
                    </StyledButton>
                </StyledLink>
            </RightOptions>
        </Header>
    );
};

const NavbarProtected = () => {

    const [signOutLoading, setSignOutLoading] = useState(false);
    const port = process.env.REACT_APP_DEV === 'true' ? process.env.REACT_APP_D_BACKEND_PORT : process.env.REACT_APP_P_BACKEND_PORT;

    const { logout } = useAuth();
    const navigate = useNavigate();


    const signout = async () => {
        console.log("Signing out")
        setSignOutLoading(true);
        try {
            await axios.post(`http://localhost:${port}/api/auth/logout`, {}, {withCredentials: true,});
            logout();
            console.log("Success")
            navigate("/login");
        } catch (error) {
            console.error('Error during logout:', error);
        }
        setSignOutLoading(false);
    }



    return (
        <Header>
            <LeftOptions>
                <StyledLink to="/home">
                    <img src={BenchLogo} alt="Bench Logo" style={{width: '150px'}}/>
                </StyledLink>
            </LeftOptions>
            <RightOptions>
                <StyledButton type="primary" size="large" loading={signOutLoading} onClick={signout}>
                    Logout
                </StyledButton>
            </RightOptions>
        </Header>
    );
};

const Navbar = () => {
    const { isLoggedIn } = useAuth();
    return isLoggedIn ? <NavbarProtected /> : <NavbarGlobal />;
}

export default Navbar;

