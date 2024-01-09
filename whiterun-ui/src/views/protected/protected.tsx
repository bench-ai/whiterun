import React, {useEffect, useState} from 'react';
import axios from "axios";
import {useAuth} from "../../auth/auth_context";

const Protected = () => {
    const [content] = useState("logged in");
    const baseURL = process.env.REACT_APP_DEV === 'true' ? `http://localhost:8080/api` : '';
    const { user } = useAuth();

    useEffect(() => {
        (async () => {
            try {
                await axios.post(`${baseURL}/api/auth/test`, {}, {
                    withCredentials: true,
                });
                console.log(user);
            } catch (e) {
                console.log(e);
            }
        })();
    }, [baseURL]);

    return (
        <div>
            <h3>{content}</h3>
            <h3>Hello {user?.username}</h3>
        </div>
    );
};

export default Protected;