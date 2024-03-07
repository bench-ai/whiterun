import styled from 'styled-components';

export const Column = styled.div`
`;

export const ModelGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    grid-gap: 15px;
    overflow-y: auto;
    margin: 20px;
    max-height: 500px;
`;

export const SelectedGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    grid-gap: 15px;
    margin-bottom: 10px;
`;

export const ModelHeader = styled.h2`
    border-bottom: 1px white;
    text-decoration: underline;
    margin-bottom: 15px;
`;

export const ModelText = styled.div`
    background: transparent;
    border: 0px;
    color: white;
    font-size: 18px;
    `;

export const ModelDescription = styled.div`
    background: transparent;
    border: 0px;
    color: white;
    font-size: 18px;
    line-height: 20px;
    margin-top: 15px;
`;