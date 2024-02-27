import styled from 'styled-components'
import CheckableTag from "antd/es/tag/CheckableTag";

export const InpaintHeader = styled.h2`
    font-size: 35px;
    color: white;
    display: flex;
`;

export const StyledCheckableTag = styled(CheckableTag)`
    font-size: 24px;
    padding: 10px;
    border-radius: 20px;
    border: none;
    margin-right: 10px;
    margin-bottom: 10px;
    background: ${(props) => (props.checked ? '#53389E' : 'white')};
    color: ${(props) => (props.checked ? 'white' : 'black')};
    cursor: pointer;
    font-weight: bold;

    &:hover {
        filter: brightness(75%);
    }
`;

export const EditorButtonColumn = styled.div`
    flex-grow: 1;
    margin: 0 15px 15px 15px;
`;

export const EditButton = styled.button`
    background-color: #39a047;
    border: none;
    color: white;
    padding: 8px 16px;
    text-align: center;
    text-decoration: none;
    display: inline-block;
    font-size: 14px;
    font-weight: bold;
    border-radius: 10px;
    cursor:pointer;
    width: 100%;
    margin-top: 8px;
`;

export const ImageEditor = styled.div`
    background-color: #232e3e;
    margin: 15% auto;
    padding: 20px;
    border-radius: 15px;
    max-width: fit-content;
    max-height: 80%;
    overflow-y: scroll;
`;

export const ImageEditorSlider = styled.input`
    -webkit-appearance: none;
    margin-top: 15px;
    width: 98%;
    border: 1px solid #3FB950; /* Set border color for disabled state */
    height: 1px;
    background-color: #3FB950;
    border-radius: 1px;
`;