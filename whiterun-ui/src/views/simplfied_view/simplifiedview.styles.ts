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
    user-select: none;
`;


