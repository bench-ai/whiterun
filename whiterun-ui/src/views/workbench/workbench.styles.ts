import styled from 'styled-components';

export const TutorialCardList = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    grid-gap: 30px;

    @media screen and (min-width: 600px) {
        grid-template-columns: repeat(auto-fill, minmax(500px, 1fr));
    }
`;

export const TutorialVideo = styled.iframe`
    width: 100%;

    @media screen and (min-width: 600px) {
        height: 300px;
        padding-bottom: 0; /* Reset padding for larger screens */
    }
`;

export const TutorialVideoModal = styled.iframe`
    width: 100%;
    height: 250px;

    @media screen and (min-width: 600px) {
        height: 400px;
        padding-bottom: 0; /* Reset padding for larger screens */
    }
`;
