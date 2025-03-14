import styled from 'styled-components';

export const Prompt = styled.textarea.attrs({ rows: 10 })`
    width: 100%;
    background-color: #12181F;
    color: white;
    border-radius: 10px; /* Adjust the radius as needed */
`;

export const Enhancement = styled.div`
    color: white;
    display: flex;
    align-items: center;
`;

export const Text = styled.span`
    margin-right: 5px;
    width: 125px;
`;