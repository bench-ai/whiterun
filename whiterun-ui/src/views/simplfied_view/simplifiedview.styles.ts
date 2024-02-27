import styled from 'styled-components';

export const ModeSection = styled.div`
    margin: auto;
    max-width: 1000px;
`;

export const ModeHeader = styled.h2`
    font-size: 35px;
    color: white;
    display: flex;
`;

export const ButtonRow = styled.div`
   display: flex;
   flex-wrap: wrap;
`;

export const ModeButton = styled.div`
    font-size: 24px;
    padding: 10px;
    border-radius: 20px;
    border: none;
    margin-right: 50px;
    margin-bottom: 10px;
    background: white;
    textAlign: 'center';
    cursor: pointer;

    &:hover {
        filter: brightness(75%);
    }
`;


