import React from 'react';
import { Card } from 'antd';
import {TemplateCardContent} from "./workflow_template_card.styles";

interface TemplateCardProps {
    title: string;
    selected: boolean;
    onSelect: () => void;
}

export const TemplateCard: React.FC<TemplateCardProps> = ({ title, selected, onSelect }) => {
    return (
        <Card
            hoverable
            style={{maxWidth: 500, borderColor: selected ? '#39a047' : '#12181f' }}
            onClick={onSelect}
        >
            <TemplateCardContent>
                <h2>{title}</h2>
            </TemplateCardContent>
        </Card>
    );
};

export default TemplateCard;