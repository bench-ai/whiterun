import React, {useEffect, useState} from 'react';
import axios from "axios";
import SliderOperator from "../../components/slider_operator/slider_operator";
import {Background, Controls, ReactFlow} from "reactflow";
import CheckboxOperator from "../../components/checkbox_operator/checkbox_operator";



const AppPage = () => {

    return (
        <div>
            <div>
                <SliderOperator/>
                <div style={{margin: "15px 15px"}}/>
                <CheckboxOperator/>
            </div>
        </div>
    );
};

export default AppPage;