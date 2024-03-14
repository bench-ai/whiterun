import styled from 'styled-components';
import {Modal} from "antd";

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
    max-width: 1000px;
    height: 500px;

`;

export const HelpModal = styled(Modal)`
    min-width: calc(100vw - 500px);
    max-width: 1000px;
    padding: 0;
    min-height: 80vh;
    max-height: 700px;
    overflow-y: scroll;

    @media screen and (max-width: 1500px) {
        min-width: calc(100vw - 10px * 10);
    }
    
    .ant-modal-content {
        padding: 0;
    }
`
