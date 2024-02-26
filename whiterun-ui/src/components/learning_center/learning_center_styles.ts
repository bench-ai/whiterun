import styled from 'styled-components'
import {Content} from "antd/es/layout/layout";

export const SiderDivider = styled.div`
    border-left: 1px solid rgb(49,49,49);

    @media screen and (max-width: 992px) {
        display: none;
    }
`;

export const LearningLayout = styled(Content)`
    padding: 0 50px 40px 50px;
    overflow-y: scroll;

    @media screen and (max-width: 992px) {
        padding: 0 30px 40px 0;
    }
`;