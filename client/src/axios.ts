import axios from 'axios';

// Create an instance of axios with custom configuration
const axiosInstance = axios.create({
    baseURL: `${import.meta.env.VITE_BACKENDURI}`,
    // timeout: 5000,
    headers: {
        'Content-Type': 'application/json',
    },
});

export default axiosInstance;