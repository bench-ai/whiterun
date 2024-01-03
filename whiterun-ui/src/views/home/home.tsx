import React, {useState} from 'react';
import {
    AppBar,
    Box, Button, CssBaseline,
    Divider,
    Drawer, IconButton,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText, Stack,
    Toolbar,
    Typography
} from "@mui/material";

import InboxIcon from '@mui/icons-material/MoveToInbox';
import MailIcon from '@mui/icons-material/Mail';
import MenuIcon from '@mui/icons-material/Menu';
import BenchLogo from "../../assets/bench.svg";
import ApiCard from "../../components/api_card/api_card";
import axios from "axios";
import {Navigate} from "react-router-dom";
const port = process.env.REACT_APP_DEV === 'true' ? process.env.REACT_APP_D_BACKEND_PORT : process.env.REACT_APP_P_BACKEND_PORT;

const Home = () => {

    const drawerWidth = 240;
    const [mobileOpen, setMobileOpen] = React.useState(false);
    const [redirect, setRedirect] = useState(false);

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleLogout = async () => {
        try {
            await axios.post(`http://localhost:${port}/api/auth/logout`, {

            }, {withCredentials: true, });

            setRedirect(true);
        } catch (error) {
            console.error('Error during logout:', error);
        }
    };

    if (redirect) {
        return <Navigate to="/login"/>
    }

    const drawer = (
        <div>
            <Toolbar disableGutters={true} sx={{display: 'flex', justifyContent: 'center', paddingLeft: '12px'}}>
                <img src={BenchLogo} style={{maxWidth: '150px'}} alt="Bench Logo"/>
            </Toolbar>
            <Divider/>
            <List>
                {['Browse'].map((text, index) => (
                    <ListItem key={text} disablePadding>
                        <ListItemButton>
                            <ListItemIcon>
                                {index % 2 === 0 ? <InboxIcon/> : <MailIcon/>}
                            </ListItemIcon>
                            <ListItemText primary={text}/>
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
        </div>
    );

    return (
        <Box sx={{display: 'flex'}}>
            <CssBaseline/>
            <AppBar
                position="fixed"
                sx={{
                    width: {sm: `calc(100% - ${drawerWidth}px)`},
                    ml: {sm: `${drawerWidth}px`},
                }}
            >
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{mr: 2, display: {sm: 'none'}}}
                    >
                        <MenuIcon/>
                    </IconButton>
                    <Stack direction='row' spacing={4} flexGrow={1}>
                        <Button color='inherit'>Browse</Button>
                        <Button color='inherit'>Manage my API</Button>
                    </Stack>
                        <Button color='inherit' onClick={handleLogout}>Logout</Button>
                </Toolbar>
            </AppBar>
            <Box
                component="nav"
                sx={{width: {sm: drawerWidth}, flexShrink: {sm: 0}}}
                aria-label="mailbox folders"
            >
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{
                        keepMounted: true,
                    }}
                    sx={{
                        display: {xs: 'block', sm: 'none'},
                        '& .MuiDrawer-paper': {boxSizing: 'border-box', width: drawerWidth, borderWidth: 0},
                    }}
                >
                    {drawer}
                </Drawer>
                <Drawer
                    variant="permanent"
                    sx={{
                        display: {xs: 'none', sm: 'block'},
                        '& .MuiDrawer-paper': {boxSizing: 'border-box', width: drawerWidth, borderWidth: 0},
                    }}
                    open
                >
                    {drawer}
                </Drawer>
            </Box>
            <Box
                component="main"
                sx={{flexGrow: 1, p: 3, width: {sm: `calc(100% - ${drawerWidth}px)`}}}
            >
                <Toolbar/>
                <Typography variant="h3">
                    Marketplace
                </Typography>
                <Divider sx={{width: "85%", bgcolor: "#3FB950", borderBottomWidth: 2}}/>
                <div style={{marginBottom: '60px'}}/>
                <ApiCard/>
            </Box>
        </Box>
    );
}

export default Home;