import React, {SyntheticEvent, useState} from 'react';

const Login = () => {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const port = process.env.REACT_APP_DEV === 'true' ? process.env.REACT_APP_D_BACKEND_PORT : process.env.REACT_APP_P_BACKEND_PORT;

    const submit = async (e: SyntheticEvent) => {
        e.preventDefault();
        console.log(port);

        const response = await fetch(`http://localhost:${port}/api/auth/login`, {
            method: 'Post',
            credentials: 'include',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify( {
                email,
                password,
            })
        });
        console.log(response.status);
        const content = await response.json();
        console.log(content);
    }

    return (
        <div className="login">
            <h4>Login</h4>
            <form onSubmit={submit}>
                <input type="text" placeholder={"Email Address"} required
                       onChange={e => setEmail(e.target.value)}
                />
                <input type="text" placeholder={"Password"} required
                       onChange={e => setPassword(e.target.value)}
                />
                <button type={"submit"}>Login</button>
            </form>
        </div>
    );
};

export default Login;