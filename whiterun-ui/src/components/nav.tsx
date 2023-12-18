import React from 'react';
import {
    AppBar,
    Button,
    Stack,
    Toolbar,
} from "@mui/material";
import BenchLogo from "../assets/bench.svg";

const Nav = () => {

    return (
        <AppBar position='sticky'>
            <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <img src={BenchLogo} style={{maxWidth: '200px'}}/>
                <Stack direction='row' spacing={2}>
                    <Button color='inherit'>Login</Button>
                    <Button color='inherit'>Register</Button>
                </Stack>
            </Toolbar>
        </AppBar>
    );
};

export default Nav;