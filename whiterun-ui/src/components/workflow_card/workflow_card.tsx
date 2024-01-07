import React, {FC} from 'react';
import {Card} from "antd";
import {Link, useNavigate} from "react-router-dom";

interface Workflow {
    id: string,
    name: string,
}

export const WorkflowCard: FC<Workflow> = ({ id, name }) => {
    const navigate = useNavigate();

    return (
        <Link reloadDocument to={`/workbench?id=${id}`}>
            <Card hoverable={true} bordered={false} style={{ maxWidth: 500 }}>
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
        </Link>
    );
};

export default WorkflowCard;