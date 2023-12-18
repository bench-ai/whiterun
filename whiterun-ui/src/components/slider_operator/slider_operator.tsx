import React, {useEffect, useState} from 'react';
import {StyledContainer, StyledSlider} from "./slider_operator.styles";


const SliderOperator = () => {

    return (
        <div style={{
            width: "350px",
            height: "auto",
            margin: "auto",
            backgroundColor: "#12181f",
            borderRadius: "10px",
            padding: "15px"
        }}>
            <h1>Audio Slider</h1>
            <form style={{margin: "auto", marginBottom: "30px"}}>
                <label htmlFor="fname">First name:</label><br/>
                <input type="text" id="fname" name="fname"
                       style={{padding: "10px", borderRadius: "5px", marginBottom: "15px"}}/><br/>
                <label htmlFor="lname">Last name:</label><br/>
                <input type="text" id="fname" name="lname"
                       style={{padding: "10px", borderRadius: "5px", marginBottom: "15px"}}/><br/>
                <input type="submit" value="Submit" style={{padding: "10px"}}/>
            </form>
            <hr style={{border: "1px solid black", marginBottom: "30px"}}/>

            <StyledContainer>
                <StyledSlider type="range" />
            </StyledContainer>
        </div>
    );
};

export default SliderOperator;