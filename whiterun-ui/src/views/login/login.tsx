import React from 'react';

const Login = () => {

    const [username, setUsername] = React.useState('');
    const [password, setPassword] = React.useState('');
    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        console.log('username:', username);
        console.log('password:', password);
    };

    return (
        <div className="login">
            <h4>Login</h4>
            <form onSubmit={handleSubmit}>
                <label>
                    Username:
                    <input type="text" value={username} onChange={(event) => setUsername(event.target.value)}/>
                </label>
                <label>
                    Password:
                    <input type="password" value={password} onChange={(event) => setPassword(event.target.value)}/>
                </label>
                <button type="submit">Login</button>
            </form>
            <a className="link" href="/signup">Sign Up</a>
        </div>
    );
};

export default Login;