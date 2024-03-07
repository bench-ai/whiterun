import styled from 'styled-components';
import {Card} from "antd";


export const VideoList = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    grid-gap: 20px;
    

`;

export const TutorialThumbnail = styled.img`
    display: block;
    object-fit: cover;
    object-position: left;
    width: 100%;
    height: 100%;
    border-radius: 16px;
`;


export const CenteredPlayButton = styled.div`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 32px;
    color: white;
    cursor: pointer;
    z-index: 1;
    transition: transform 0.3s ease;
`;

export const VideoContainer = styled.div`
    &:hover ${CenteredPlayButton} {
        transform: translate(-50%, -50%) scale(1.2); // Scale the play button on hover
    }

    max-width: 300px;
`;

export const VideoCard = styled(Card)`
    .ant-card-body {
        padding: 0;
        position: relative;
        border: 1px solid rgba(194,195,197,.5); /* Add border styles here */
        border-radius: 16px; /* Add border radius if desired */
    }


`;

export const SmallHeadingSection = styled.div`
    cursor: pointer;
`;

export const SmallHeading = styled.h3`
    margin: 5px 0;
    font-size: 16px;
    font-weight: bold;
    color: grey;
`;