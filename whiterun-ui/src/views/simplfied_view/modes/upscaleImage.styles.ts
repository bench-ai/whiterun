import styled from 'styled-components'
import {Carousel} from "antd";

export const ImageUploadCarousel = styled(Carousel)`
    .slick-prev,
    .slick-next {
        color: unset;
        font-size: 40px;
        width: 50px;
        height: 50px;
        z-index: 1;
    }

    .slick-prev {
        inset-inline-start: 0;
    }
    
    .slick-next{
        inset-inline-end: 0;
    }

    /* Hover and focus styles for carousel navigation */
    .slick-prev:hover,
    .slick-next:hover,
    .slick-prev:focus,
    .slick-next:focus {
        color: unset;
        /* Add your additional hover/focus styles here */
        /* For example, you can add a background color, transition, etc. */
    }
`;

export const ImageContainer = styled.div`
    display: block;
    margin-left: auto;
    margin-right: auto;
    width: 50%;
`;
