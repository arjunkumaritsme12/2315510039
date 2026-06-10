import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://4.224.186.213/evaluation-service';

const DEMO_NOTIFICATIONS = [
  {
    ID: 'demo-placement-1',
    Type: 'Placement',
    Message: 'Placement drive is scheduled for next week.',
    Timestamp: '2026-06-10T09:30:00Z',
  },
  {
    ID: 'demo-result-1',
    Type: 'Result',
    Message: 'Your interview result is now available.',
    Timestamp: '2026-06-08T10:00:00Z',
  },
  {
    ID: 'demo-event-1',
    Type: 'Event',
    Message: 'Campus career fair has been announced.',
    Timestamp: '2026-06-07T15:00:00Z',
  },
];

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

  try {
    const response = await apiClient.get('/notifications', { params });
    return response.data;
  } catch (error) {
    if (error?.response?.status === 401 || error?.response?.status === 403) {
      const filtered = DEMO_NOTIFICATIONS.filter((item) => !notification_type || item.Type === notification_type);
      return { notifications: filtered.slice(0, limit) };
    }
    throw error;
  }
};

export default apiClient;
