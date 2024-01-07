import axios from "axios";
import globalRouter from "../globalRouter";

const port = process.env.REACT_APP_DEV === 'true' ? process.env.REACT_APP_D_BACKEND_PORT : process.env.REACT_APP_P_BACKEND_PORT;
axios.defaults.baseURL = `http://localhost:${port}/api/`;

let isRefreshing = false;

axios.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response.status === 401 && !isRefreshing) {
            isRefreshing = true;

            try {
                // Refresh the token
                const response = await axios.post('auth/refresh', {}, { withCredentials: true });

                // Update the original request headers with the new token
                originalRequest.headers.Authorization = `Bearer ${response.data.access_token}`;

                // Retry the original request with the new token
                return axios(originalRequest);
            } catch (refreshError) {
                // If token refresh fails, navigate to the login page
                if (globalRouter && globalRouter.navigate) {
                    await axios.post(`http://localhost:${port}/api/auth/logout`, {}, { withCredentials: true });
                    globalRouter.navigate("/login");
                }

                // If token refresh fails, reject the original request
                return Promise.reject(error);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);