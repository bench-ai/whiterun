import React, {FC} from 'react';
import {Column, ModelDescription, ModelGrid, ModelHeader, ModelText} from "./generatorColumn.styles";
import {Card} from "antd";

interface Workflow {
    name: string,
    difficulty: string,
    description: string
}

const WorkflowCard: FC<Workflow> = ({description, difficulty, name }) => {

    const difficultySentence = `Difficulty: ${difficulty}`

    return (
        <Card
            hoverable={true}
            bordered={false}
            style={{width: 250, marginTop: 20, marginLeft: 20}}>
            <div>
                <ModelHeader style={{marginTop: -20, borderBottom: 1}}>{name}</ModelHeader>
                <ModelText>{difficultySentence}</ModelText>
                <ModelDescription>{description}</ModelDescription>
            </div>
        </Card>
    );
};

const GeneratorColumn = () => {

    const textToImage = [
        {
            "name": "realvisxl-v2.0",
            "difficulty": "medium",
            "description": "A Generator fine tuned to create realistic images, especially of human beings"
        },
        {
            "name": "realvisxl-v2.0",
            "difficulty": "medium",
            "description": "A Generator fine tuned to creating realistic images, especially of human beings"
        },
        {
            "name": "realvisxl-v2.0",
            "difficulty": "medium",
            "description": "A Generator fine tuned to creating realistic images, especially of human beings"
        },
        {
            "name": "realvisxl-v2.0",
            "difficulty": "medium",
            "description": "A Generator fine tuned to creating realistic images, especially of human beings"
        },
        {
            "name": "realvisxl-v2.0",
            "difficulty": "medium",
            "description": "A Generator fine tuned to creating realistic images, especially of human beings"
        },
        {
            "name": "realvisxl-v2.0",
            "difficulty": "medium",
            "description": "A Generator fine tuned to creating realistic images, especially of human beings"
        },
        {
            "name": "realvisxl-v2.0",
            "difficulty": "medium",
            "description": "A Generator fine tuned to creating realistic images, especially of human beings"
        },
        {
            "name": "realvisxl-v2.0",
            "difficulty": "medium",
            "description": "A Generator fine tuned to creating realistic images, especially of human beings"
        },
        {
            "name": "realvisxl-v2.0",
            "difficulty": "medium",
            "description": "A Generator fine tuned to creating realistic images, especially of human beings"
        },
        {
            "name": "realvisxl-v2.0",
            "difficulty": "medium",
            "description": "A Generator fine tuned to creating realistic images, especially of human beings"
        },
        {
            "name": "realvisxl-v2.0",
            "difficulty": "medium",
            "description": "A Generator fine tuned to creating realistic images, especially of human beings"
        }
    ]

    return (
        <Column>
            <ModelGrid>
                {textToImage &&
                textToImage.map((obj) => (
                <WorkflowCard description={obj["description"]} name={obj["name"]} difficulty={obj["difficulty"]}/>
                ))}
            </ModelGrid>
        </Column>
    );
};

export default GeneratorColumn;