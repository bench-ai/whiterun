import styled from "styled-components";
import {Button} from "antd";
import {Link} from "react-router-dom";

export const Header = styled.div`
    display: flex;
    justify-content: space-between;
    background-color: #0d1117;
    padding: 5px 20px 5px 20px;
    height: 50px;
    align-items: center;
    
`;

export const LeftOptions = styled.div`
    display: flex;
    align-items: center;
    justify-content: flex-start;
    padding-left: 10px;
`;

export const RightOptions = styled.div`
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding-right: 20px;

    @media (max-width: 450px) {
        /* Hide Discord button when screen width is smaller than 450px */
        & > div:last-child {
            display: none;
        }
`;

export const StyledLink = styled(Link)`
    text-decoration: none;
`;

export const StyledButton = styled(Button)`
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 10px;
`;

