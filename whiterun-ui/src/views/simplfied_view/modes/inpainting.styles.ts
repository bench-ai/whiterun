import styled from 'styled-components'
import CheckableTag from "antd/es/tag/CheckableTag";

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
    margin: 0 40px 15px 15px;
    position: relative;
    max-width: 450px;
    display: flex;
    flex-direction: column;
`;

export const MaskEditorTitle = styled.h2`
    color: white;
    margin-top: 0;
    margin-bottom: 5px;
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

export const SaveButton = styled.button`
    background-color: #53389e;
    border: none;
    color: white;
    padding: 12px 16px;
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
    background-color: #161a20;
    margin: 50px auto auto auto;
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

export const UploadContainer = styled.div`
    margin: auto;
    text-align: center;
    width: 100%;
    color: #d3d3d4;
    background-color: #161a20;
    border-radius: 15px;
    border: 1px dashed #374a66;

    label {
        display: block;
        height: 100%;
        padding: 30px;
        cursor: pointer;
    }
    
    &:hover {
        border-color: #3FB950;
    }

    input {
        display: none;  /* Hide the input */
    }
`;

interface UploadedFileContainerProps {
    visible: boolean;
}

export const UploadedFileContainer = styled.div<UploadedFileContainerProps>`
    display: ${(props) => (props.visible ? 'block' : 'none')};
    margin-top: 10px;
    padding: 15px;
    color: #fff;
    border-radius: 10px;
    animation: fadeIn 0.5s ease-in-out;

    @keyframes fadeIn {
        from {
            opacity: 0;
        }
        to {
            opacity: 1;
        }
    }

    &:hover {
        background-color: #161a20;
    }
`;

export const BrushTitle = styled.label`
    color: white;
    font-weight: bold;
    font-size: 16px;
`;