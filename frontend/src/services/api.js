import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://4.224.186.213/evaluation-service';

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

// Request interceptor for logging
apiClient.interceptors.request.use((config) => {
  console.info(`[API] ${config.method?.toUpperCase()} ${config.url}`, config.params);
  return config;
});

// Response interceptor for logging
apiClient.interceptors.response.use(
  (response) => {
    console.info(`[API] Response ${response.status} from ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error(`[API] Error: ${error.message}`);
    return Promise.reject(error);
  }
);

export const fetchNotifications = async ({ page = 1, limit = 20, notification_type = '' } = {}) => {
  const params = { page, limit };
  if (notification_type) params.notification_type = notification_type;

  const response = await apiClient.get('/notifications', { params });
  return response.data;
};

export default apiClient;
