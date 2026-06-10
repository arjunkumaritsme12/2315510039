import { Box, Stack, Typography } from '@mui/material';
import NotificationCard from './NotificationCard';

export default function NotificationList({ notifications, viewedIds, onSelect, scoreMap = {} }) {
  if (!notifications.length) {
    return (
      <Box py={4} textAlign="center">
        <Typography color="text.secondary">No notifications match the current filters.</Typography>
      </Box>
    );
  }

  return (
    <Stack spacing={1.5}>
      {notifications.map((notification) => (
        <NotificationCard
          key={notification.ID}
          notification={notification}
          viewed={viewedIds.has(notification.ID)}
          score={scoreMap[notification.ID] ?? null}
          onClick={() => onSelect(notification.ID)}
        />
      ))}
    </Stack>
  );
}
