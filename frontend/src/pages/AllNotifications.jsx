import { useEffect, useMemo, useState } from 'react';
import { Alert, Box, Chip, Container, Pagination, Snackbar, Stack, Typography } from '@mui/material';
import FilterBar from '../components/FilterBar';
import Loader from '../components/Loader';
import NotificationList from '../components/NotificationList';
import { fetchNotifications } from '../api/notificationApi';
import { filterNotifications } from '../utils/priorityHelper';

const PAGE_SIZE = 8;

export default function AllNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [notificationType, setNotificationType] = useState('');
  const [searchText, setSearchText] = useState('');
  const [viewedIds, setViewedIds] = useState(() => new Set(JSON.parse(localStorage.getItem('viewedNotifications') || '[]')));
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const loadNotifications = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await fetchNotifications({ page, limit: PAGE_SIZE, notificationType });
      setNotifications(result.notifications || []);
      if (result.source === 'fallback') {
        setError('Using demo notifications because the remote API rejected the request.');
        setSnackbarOpen(true);
      }
    } catch (err) {
      setError(err?.message || 'Unable to load notifications.');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [page, notificationType]);

  const filteredNotifications = useMemo(() => filterNotifications(notifications, notificationType, searchText), [notifications, notificationType, searchText]);

  const handleViewed = (id) => {
    setViewedIds((current) => {
      const next = new Set(current);
      next.add(id);
      localStorage.setItem('viewedNotifications', JSON.stringify([...next]));
      return next;
    });
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2} flexWrap="wrap" gap={2}>
        <Box>
          <Typography variant="h4" fontWeight={700}>All Notifications</Typography>
          <Typography color="text.secondary">Browse every notification and track what you have already reviewed.</Typography>
        </Box>
        <Chip label={`${notifications.length} loaded`} color="primary" variant="outlined" />
      </Stack>

      <FilterBar notificationType={notificationType} onTypeChange={setNotificationType} searchText={searchText} onSearchChange={setSearchText} />

      {error && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? <Loader /> : <NotificationList notifications={filteredNotifications} viewedIds={viewedIds} onSelect={handleViewed} />}

      {!loading && filteredNotifications.length > 0 && (
        <Box display="flex" justifyContent="center" mt={4}>
          <Pagination count={Math.max(1, Math.ceil(notifications.length / PAGE_SIZE))} page={page - 1} onChange={(_, value) => setPage(value + 1)} color="primary" />
        </Box>
      )}

      <Snackbar open={snackbarOpen} autoHideDuration={4000} onClose={() => setSnackbarOpen(false)} message={error} />
    </Container>
  );
}
