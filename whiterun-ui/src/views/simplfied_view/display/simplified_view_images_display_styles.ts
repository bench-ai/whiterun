import styled from 'styled-components'
import {ModeButton} from "../simplifiedview.styles";

export const GeneratedCard = styled.div`
    padding: 30px;
    border: 1px solid white;
    border-radius: 15px;
`;

export const GeneratedCardHeader = styled.div`
    display: flex;
    justify-content: space-between;
    padding: 0 15px
`;

export const GeneratedCardDownload = styled(ModeButton)`
    font-size: 18px;
    max-width: 125px;
    margin: 15px auto;
    background-color: #53389E;
    color: white;
    font-weight: bold;
`;

export const DisabledPrompt = styled.textarea.attrs({ rows: 10 })`
    height: 100%;
    width: 80%; 
    resize: none;
`

export const DisabledError = styled.textarea.attrs({ rows: 3 })`
    height: 100%;
    width: 80%; 
    resize: none;
`
