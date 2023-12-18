import React, {useEffect, useState} from 'react';
import axios from "axios";

const Protected = () => {
    const [content] = useState("");
    const port = process.env.REACT_APP_DEV === 'true' ? process.env.REACT_APP_D_BACKEND_PORT : process.env.REACT_APP_P_BACKEND_PORT;

    useEffect(() => {
        console.log('Component rendered');
        (async () => {
            try {
                await axios.post(`http://localhost:${port}/api/auth/test`, {}, {
                    withCredentials: true,
                });
            } catch (e) {
                console.log(e);
            }
        })();
    }, []);

    return (
        <div>
            <h3>{content}</h3>
        </div>
    );
};

export default Protected;