import React, {createContext, useContext, useState, ReactNode, useEffect} from 'react';
import axios from "axios";


interface Workflow {
    name: string;
}

interface User {
    created_at: number;
    email: string;
    token_count: number;
    updated_at: number;
    username: string;
    verified: boolean;
    work_flows: Record<string, Workflow>;
}

interface AuthContextProps {
    isLoggedIn: boolean;
    workflows: Record<string, Workflow> | null;
    user: User | null;
    login: () => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({children}) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [workflows, setWorkflows] = useState<Record<string, Workflow> | null>(null);

    const port = process.env.REACT_APP_DEV === 'true' ? process.env.REACT_APP_D_BACKEND_PORT : process.env.REACT_APP_P_BACKEND_PORT;

    useEffect(() => {
        // Check if user details are saved in local storage
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                setUser(parsedUser);
                setIsLoggedIn(true);
            } catch (error) {
                console.error('Error parsing user details:', error);
            }
        } else {
            onLoad();
        }
    }, [isLoggedIn]);

    const onLoad = async () => {
        try {
            const response = await axios.get(
                `http://localhost:${port}/api/user/details`, {
                    withCredentials: true,
                }
            );
            // console.log(response.data);
            const userData = response.data;
            console.log(userData);

            // Save user details in local storage
            localStorage.setItem('user', JSON.stringify(userData));

            setUser(userData);
            setWorkflows(userData.work_flows);

            setIsLoggedIn(true);
        } catch (error) {
            // Handle error or redirect to login if necessary
            console.error('Error fetching user details:', error);
        }
    };

    const login = async () => {
        setIsLoggedIn(true);
        // Additional logic for fetching user details upon login
        await onLoad();
    };

    const logout = () => {
        setIsLoggedIn(false);
        setUser(null); // Clear user data on logout
        localStorage.removeItem('user');
    };

    return (
        <AuthContext.Provider value={{ isLoggedIn, user, workflows, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextProps => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};