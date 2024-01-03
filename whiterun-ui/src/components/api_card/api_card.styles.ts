import styled from 'styled-components';

export const ApiCardTitle = styled.h2`
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    margin: 0;
`;

export const ApiCardDescription = styled.p`
    font-size: 14px;
    display: -webkit-box;
    -webkit-line-clamp: 4;
    -webkit-box-orient: vertical;
    overflow: hidden;
    margin: 10px 0 0 0;
`;