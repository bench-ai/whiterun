import React, {SyntheticEvent, useState} from 'react';

const Register = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');

    const submit = async (e: SyntheticEvent) => {
        e.preventDefault();

        const response = await fetch('http://localhost:8080/api/auth/signup', {
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