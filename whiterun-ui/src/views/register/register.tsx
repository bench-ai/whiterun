import React, {SyntheticEvent, useState} from 'react';

const Register = () => {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const port = process.env.REACT_APP_DEV === 'true' ? process.env.REACT_APP_D_BACKEND_PORT : process.env.REACT_APP_P_BACKEND_PORT;

    const submit = async (e: SyntheticEvent) => {
        e.preventDefault();
        console.log(port);

        const response = await fetch(`http://localhost:${port}/api/auth/signup`, {
            method: 'Post',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify( {
                email,
                password,
                username,
            })
        });
        console.log(response.status);
        const content = await response.json();
        console.log(content);

    }

    return (
        <div>
            <form onSubmit={submit}>
                <input type="text" placeholder={"Email Address"} required
                       onChange={e => setEmail(e.target.value)}
                />
                <input type="text" placeholder={"Password"} required
                       onChange={e => setPassword(e.target.value)}
                />
                <input type="text" placeholder={"Username"} required
                       onChange={e => setUsername(e.target.value)}
                />
                <button type={"submit"}>Register</button>
            </form>
        </div>
    );
};

export default Register;