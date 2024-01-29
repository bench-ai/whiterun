import React, {useState} from 'react';
import BenchLogo from "../../assets/bench.svg";
import axios from "axios";
import {useNavigate} from "react-router-dom";
import {Header, LeftOptions, RightOptions, StyledButton, StyledLink} from "./navbar.styles";
import {useAuth} from "../../auth/auth_context";
import DiscordLogo from "../../assets/discordLogo.svg";
import {Button} from "antd";

const NavbarGlobal = () => {

    return (
        <Header>
            <LeftOptions>
                <a href="https://www.bench-ai.com/" target="_blank" rel="noopener noreferrer">
                    <img src={BenchLogo} alt="Bench Logo" style={{width: '150px'}}/>
                </a>
            </LeftOptions>
            <RightOptions>
                <div style={{display: 'flex'}}>
                <StyledLink to="/login">
                    <StyledButton type="text" size="large">Sign In
                    </StyledButton>
                </StyledLink>
                <StyledLink to="register">
                    <StyledButton type="primary" size="large">Sign Up
                    </StyledButton>
                </StyledLink>
                </div>
                <div>
                <a href="https://discord.gg/Jv9fUCy7" target="_blank" rel="noopener noreferrer">
                    <Button type="primary" size={"large"} style={{
                        backgroundColor: '#404eed',
                        borderColor: '#404eed',
                        fontWeight: 'bold',
                        fontSize: '16px',
                        display: 'flex',
                        alignItems: 'center'
                    }}>
                        <img src={DiscordLogo}></img>
                    </Button>
                </a>
                </div>
            </RightOptions>
        </Header>
    );
};

const NavbarProtected = () => {

    const [signOutLoading, setSignOutLoading] = useState(false);
    const baseURL = process.env.REACT_APP_DEV === 'true' ? `http://localhost:8080/api` : '';

    const {logout} = useAuth();
    const navigate = useNavigate();


    const signout = async () => {
        console.log("Signing out")
        setSignOutLoading(true);
        try {
            await axios.post(`${baseURL}/auth/logout`, {}, {withCredentials: true,});
            logout();
            navigate("/login");
        } catch (error) {
            console.error('Error during logout:', error);
        }
        setSignOutLoading(false);
    }

    return (
        <Header>
            <LeftOptions>
                <StyledLink to="/">
                    <img src={BenchLogo} alt="Bench Logo" style={{width: '150px'}}/>
                </StyledLink>
            </LeftOptions>
            <RightOptions>
                <a href="https://discord.gg/Jv9fUCy7" target="_blank" rel="noopener noreferrer">
                    <StyledButton type="primary" size={"large"} style={{
                        backgroundColor: '#404eed',
                        borderColor: '#404eed',
                    }}>
                        <img src={DiscordLogo}></img>
                    </StyledButton>
                </a>
                <StyledButton type="primary" size="large" loading={signOutLoading} onClick={signout}>
                    Logout
                </StyledButton>
            </RightOptions>
        </Header>
    );
};

const Navbar = () => {
    const {isLoggedIn} = useAuth();
    return isLoggedIn ? <NavbarProtected/> : <NavbarGlobal/>;
}

export default Navbar;

