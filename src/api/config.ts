import axios from "axios";

const baseUrl = axios.create({
    baseURL: import.meta.env.VITE_APP_URL,
});

baseUrl.interceptors.request.use(
    async (config) => {
        console.log("Request URL:", config.url);
        return config;
    },
    (error) => Promise.reject(error)
);

export default baseUrl;
