import styled from 'styled-components'
import {ModeButton} from "../../views/simplfied_view/simplifiedview.styles";

export const GeneratedContainerList = styled.div`
    margin-top: 30px;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    grid-gap: 15px;
    justify-items: center;
`;

export const GeneratedCard = styled.div`
    max-width: 375px;
    border: 1px solid white;
    border-radius: 15px;
`;

export const GeneratedCardHeader = styled.div`
    display: flex;
    justify-content: space-between;
    padding: 0 15px
`;

export const GeneratedCardDownload = styled(ModeButton)`
    font-size: 18px;
    max-width: 125px;
    margin: 15px auto;
    background-color: #53389E;
    color: white;
    font-weight: bold;
`;
