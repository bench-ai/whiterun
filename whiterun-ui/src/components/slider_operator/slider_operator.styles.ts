import {css, styled} from "@mui/material";

import Button from '@mui/material/Button';

export const CustomButton = styled(Button)({

}) as typeof Button;

export const StyledDiv = styled('div')({
    width: "350px",
    height: "500px",
    margin: "auto",
    backgroundColor: "#12181f",
    borderRadius: "10px",
    padding: "15px"
});

export const StyledContainer = styled('div')({
    width: '100%',
});

export const StyledSlider = styled('input')({
    WebkitAppearance: 'none',
    width: '100%',
    height: '15px',
    borderRadius: '15px',
    background: '#3fb950',
    outline: 'none',
    opacity: 0.7,
    WebkitTransition: '.2s',
    transition: 'opacity .2s',
    ':hover': {
        opacity: 1,
    },
    '&::-webkit-slider-thumb': {
        WebkitAppearance: 'none',
        appearance: 'none',
        width: '25px',
        height: '25px',
        background: '#3fb950',
        cursor: 'pointer',
    },
    '&::-moz-range-thumb': {
        width: '25px',
        height: '25px',
        borderRadius: '50px',
        background: '#3fb950',
        cursor: 'pointer',
    },
});




