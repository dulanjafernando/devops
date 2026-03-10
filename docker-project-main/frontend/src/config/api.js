// API Configuration
// Use environment variable if available, otherwise use the IP address
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://13.233.113.169:3000";

// API endpoints
export const API_ENDPOINTS = {
    // User endpoints
    SIGNIN: '/signin',
    SIGNUP: '/signup',
    LOGOUT: '/logout',
    
    // Food endpoints
    FOOD_LIST: '/food',
    FOOD_DETAIL: (id) => `/food/${id}`,
    FOOD_CREATE: '/food',
    FOOD_UPDATE: (id) => `/food/${id}`,
    FOOD_DELETE: (id) => `/food/${id}`,
};

// Helper function to build full URLs
export const getApiUrl = (endpoint) => {
    if (typeof endpoint === 'function') {
        throw new Error('Use parameter-based endpoints like FOOD_DETAIL(id)');
    }
    return `${API_BASE_URL}${endpoint}`;
};
