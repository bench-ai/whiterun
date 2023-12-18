import axios from "axios";
import globalRouter from "../globalRouter";

const port = process.env.REACT_APP_DEV === 'true' ? process.env.REACT_APP_D_BACKEND_PORT : process.env.REACT_APP_P_BACKEND_PORT;
axios.defaults.baseURL = `http://localhost:${port}/api/`;

let refresh = false;

axios.interceptors.response.use(resp => resp, async error => {
    if (error.response.status === 401 && !refresh) {
        refresh = true;

        const response = await axios.post('auth/refresh', {}, {withCredentials: true});

        if (!response.status && globalRouter.navigate) {
            console.log("Entered")
            await axios.post(`http://localhost:${port}/api/auth/logout`, {}, {withCredentials: true,});
            globalRouter.navigate("/login");
        }
    }
    refresh = false;
    return error;
});