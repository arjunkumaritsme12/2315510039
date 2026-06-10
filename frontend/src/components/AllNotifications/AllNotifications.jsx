import { useState } from 'react';
import {
  Box, Typography, Alert, Pagination, FormControl,
  InputLabel, Select, MenuItem, Stack
} from '@mui/material';
import { useNotifications } from '../../hooks/useNotifications';
import NotificationCard from '../common/NotificationCard';
import LoadingSpinner from '../common/LoadingSpinner';

const LIMIT = 20;
const NOTIFICATION_TYPES = ['', 'Event', 'Result', 'Placement'];

export default function AllNotifications() {
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState('');

  const { notifications, loading, error, hasMore, viewedIds, markViewed } =
    useNotifications({ page, limit: LIMIT, notification_type: typeFilter });

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5" fontWeight={700}>All Notifications</Typography>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Filter by Type</InputLabel>
          <Select
            value={typeFilter}
            label="Filter by Type"
            onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
          >
            {NOTIFICATION_TYPES.map((t) => (
              <MenuItem key={t} value={t}>{t || 'All Types'}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      {error && <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>}
      {loading && <LoadingSpinner />}

      {!loading && notifications.length === 0 && (
        <Alert severity="info">No notifications found.</Alert>
      )}

      {!loading && notifications.map((notif) => {
        const isNew = !viewedIds.has(notif.ID);
        return (
          <Box key={notif.ID} onClick={() => markViewed(notif.ID)}>
            <NotificationCard notification={notif} isNew={isNew} />
          </Box>
        );
      })}

      {!loading && notifications.length > 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination
            count={hasMore ? page + 1 : page}
            page={page}
            onChange={(_, val) => setPage(val)}
            color="primary"
          />
        </Box>
      )}
    </Box>
  );
}
