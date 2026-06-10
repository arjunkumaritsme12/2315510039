import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://4.224.186.213/evaluation-service';
const ACCESS_TOKEN = import.meta.env.VITE_NOTIFICATION_ACCESS_TOKEN || '';

const FALLBACK_NOTIFICATIONS = [
  {
    ID: 'demo-placement-1',
    Type: 'Placement',
    Message: 'Berkshire Hathaway Inc. hiring',
    Timestamp: '2026-06-10 06:21:17',
  },
  {
    ID: 'demo-result-1',
    Type: 'Result',
    Message: 'External result published',
    Timestamp: '2026-06-10 04:50:29',
  },
  {
    ID: 'demo-event-1',
    Type: 'Event',
    Message: 'Campus farewell event',
    Timestamp: '2026-06-10 00:20:13',
  },
];

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    Accept: 'application/json',
    ...(ACCESS_TOKEN ? { Authorization: `Bearer ${ACCESS_TOKEN}`, 'X-API-Key': ACCESS_TOKEN } : {}),
  },
});

export async function fetchNotifications({ page = 1, limit = 20, notificationType = '' } = {}) {
  const params = { page, limit };
  if (notificationType) params.notification_type = notificationType;

  try {
    const response = await apiClient.get('/notifications', { params });
    const notifications = response?.data?.notifications || [];
    return { notifications, source: 'api' };
  } catch (error) {
    const filtered = FALLBACK_NOTIFICATIONS.filter((notification) => !notificationType || notification.Type === notificationType);
    const start = (page - 1) * limit;
    return { notifications: filtered.slice(start, start + limit), source: 'fallback' };
  }
}
