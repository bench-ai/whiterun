import React, { useState } from 'react';
import TemplateCard from "./workflow_template_card";
import {TemplateWorkflowList} from "./template_card_selector.styles";
import Title from "antd/es/typography/Title";

interface CardData {
    id: number;
    title: string;
    category: string;
}

interface CardSelectorProps {
    cardData: CardData[];
}

const CardSelector: React.FC<CardSelectorProps> = ({ cardData }) => {
    const [selectedCard, setSelectedCard] = useState<number | null>(null);

    const handleCardSelect = (id: number) => {
        if (selectedCard === id) {
            // Unselect the card if it's already selected
            setSelectedCard(null);
        } else {
            // Select the clicked card
            setSelectedCard(id);
        }
    };

    const categories = Array.from(new Set(cardData.map((card) => card.category)));

    return (
        <div>
            {categories.map((category) => (
                <div key={category}>
                    <Title level={4} style={{marginBottom: '10px'}}>{category}</Title>
                    <TemplateWorkflowList>
                    {cardData
                        .filter((card) => card.category === category)
                        .map((card) => (
                            <TemplateCard
                                key={card.id}
                                title={card.title}
                                selected={selectedCard === card.id}
                                onSelect={() => handleCardSelect(card.id)}
                            />
                        ))}
                    </TemplateWorkflowList>
                </div>
            ))}
            <p>Selected Card: {selectedCard !== null ? cardData.find((card) => card.id === selectedCard)?.title : 'None'}</p>
        </div>
    );
};

export default CardSelector;