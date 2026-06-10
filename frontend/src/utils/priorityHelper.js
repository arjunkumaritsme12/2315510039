const TYPE_WEIGHTS = {
  Placement: 3,
  Result: 2,
  Event: 1,
};

function parseTimestamp(value) {
  if (!value) return 0;
  const normalized = String(value).replace(' ', 'T');
  const parsed = Date.parse(normalized);
  return Number.isNaN(parsed) ? 0 : parsed;
}

export function getPriorityScore(notification) {
  const weight = TYPE_WEIGHTS[notification?.Type] || 1;
  const timestamp = parseTimestamp(notification?.Timestamp);
  return weight * 1000000000000 + timestamp;
}

export function sortNotificationsByPriority(notifications) {
  return [...notifications].sort((left, right) => getPriorityScore(right) - getPriorityScore(left));
}

export function getTopPriorityNotifications(notifications, top = 10) {
  return sortNotificationsByPriority(notifications).slice(0, top);
}

export function filterNotifications(notifications, notificationType = '', searchText = '') {
  return notifications.filter((notification) => {
    const matchesType = !notificationType || notification.Type === notificationType;
    const matchesSearch = !searchText || notification.Message.toLowerCase().includes(searchText.toLowerCase());
    return matchesType && matchesSearch;
  });
}
