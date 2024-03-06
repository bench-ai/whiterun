import { Timeline } from 'antd';
import styled from 'styled-components'

export const CustomTimeline = styled(Timeline)`

    div.ant-timeline-item-label {
        width: calc(18% - 12px) !important;
    }

    div.ant-timeline-item-content {
        left: calc(19% - 4px) !important;
        width: calc(79% - 4px) !important;
    }

    div.ant-timeline-item-tail,
    div.ant-timeline-item-head {
        left: 19% !important;
    }
    
    
`;



