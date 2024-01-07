import React, {FC} from 'react';
import {Card} from "antd";
import {useNavigate} from "react-router-dom";

interface Workflow {
    id: string,
    name: string,
}

export const WorkflowCard: FC<Workflow> = ({ id, name }) => {
    const navigate = useNavigate();

    return (
        <Card
            hoverable={true}
            bordered={false}
            style={{ maxWidth: 500 }}
            onClick={() => navigate(`/workbench?id=${id}`)}
        >
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                }}
            >
                <h2>{name}</h2>
            </div>
        </Card>
    );
};

export default WorkflowCard;