import axios from "axios";
import globalRouter from "../globalRouter";

const baseURL = process.env.REACT_APP_DEV === 'true' ? `http://localhost:8080/api` : 'https://app.bench-ai.com/api';
axios.defaults.baseURL = `${baseURL}/`;


let isRefreshing = false;
let isRedirectedToLogin = false;
let failedRequestsQueue: ((token: string) => void)[] = [];

const retryFailedRequests = (token: string) => {
    failedRequestsQueue.forEach((cb) => cb(token));
    failedRequestsQueue = [];
};

axios.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 || !error.response) {
            if (!isRefreshing) {
                isRefreshing = true;

                try {
                    // Refresh the token
                    const response = await axios.post(
                        "auth/refresh",
                        {},
                        { withCredentials: true }
                    );
                    isRefreshing = false;
                    const newToken = response.data.access_token;

                    // Update the original request headers with the new token
                    originalRequest.headers.Authorization = `Bearer ${newToken}`;

                    // Retry the original request with the new token
                    retryFailedRequests(newToken);

                    return axios(originalRequest);
                } catch (error) {
                    // If token refresh fails and not already redirected, navigate to the login page
                    if (!isRedirectedToLogin && globalRouter && globalRouter.navigate) {
                        isRedirectedToLogin = true;
                        await axios.post(`${baseURL}/auth/logout`, {}, { withCredentials: true });
                        globalRouter.navigate("/login");
                    }

                    // If token refresh fails, reject the original request
                    return Promise.reject(error);
                } finally {
                    isRefreshing = false;
                }
            } else {

                // Check if the error is related to the refresh token endpoint
                if (originalRequest.url.includes("auth/refresh")) {

                    await axios.post(`${baseURL}/auth/logout`, {}, { withCredentials: true });

                    if (globalRouter && globalRouter.navigate) {
                        globalRouter.navigate("/login");
                    } else {
                        console.error("Global router not available for navigation.");
                    }
                }

                // If a token refresh is already in progress, add the request to the queue
                return new Promise((resolve, reject) => {
                    failedRequestsQueue.push((token) => {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        resolve(axios(originalRequest));
                    });
                });
            }
        }

        return Promise.reject(error);
    }
);
