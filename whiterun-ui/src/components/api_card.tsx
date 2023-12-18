import React from 'react';
import {
    Card, CardActionArea,
    CardContent, Divider, Icon,
    Stack,Typography,
} from "@mui/material";
import BenchLogo from "../assets/benchLogo.svg";

const ApiCard = () => {

    return (
        <Card sx={{maxWidth: 350}}>
            <CardActionArea>
                <CardContent>
                    <Typography variant="h5" gutterBottom>
                        Word to Movie Converter
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Uses video diffusion to turn your words into movies
                        <br/>
                    </Typography>
                    <div style={{marginTop: "40px"}}/>
                    <Stack direction="row" spacing={2} sx={{alignItems: "center"}}>
                        <Icon>
                            <img src={BenchLogo} height={25} width={25} alt="Bench Logo"/>
                        </Icon>
                        <Typography variant="h6">
                            Cookie
                        </Typography>
                    </Stack>
                    <Divider sx={{marginTop: "5px", marginBottom: "20px"}}/>
                    <Stack
                        direction="row"
                        justifyContent="space-around"
                        alignItems="center"
                        spacing={3}
                    >
                        <Typography>
                            1 Token / Request
                        </Typography>
                        <Typography>
                            1 Heart
                        </Typography>
                    </Stack>

                </CardContent>
            </CardActionArea>
        </Card>
    );
};

export default ApiCard;