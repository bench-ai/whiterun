import React, {useEffect, useState} from 'react';
import axios from "axios";
import {useAuth} from "../../auth/auth_context";

const Protected = () => {
    const [content] = useState("logged in");
    const port = process.env.REACT_APP_DEV === 'true' ? process.env.REACT_APP_D_BACKEND_PORT : process.env.REACT_APP_P_BACKEND_PORT;
    const { user } = useAuth();

    useEffect(() => {
        (async () => {
            try {
                await axios.post(`http://localhost:${port}/api/auth/test`, {}, {
                    withCredentials: true,
                });
                console.log(user);
            } catch (e) {
                console.log(e);
            }
        })();
    }, [port]);

    return (
        <div>
            <h3>{content}</h3>
            <h3>Hello {user?.username}</h3>
        </div>
    );
};

export default Protected;