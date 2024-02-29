import styled from 'styled-components';

export const Column = styled.div`
    margin-top: 40px;
    width: 30%;
    border: 1px solid white;
    color: white;
    border-radius: 10px; /* Adjust the radius as needed */
`;

export const ModelGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(325px, 1fr));
    grid-template-columns: repeat(1, 1fr);
    grid-gap: 15px;
    max-height: calc(1 * (260px));
    overflow-y: auto;
`;

export const SelectedGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    grid-gap: 15px;
    max-height: calc(1 * (260px));
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