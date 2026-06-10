import { useEffect, useMemo, useState } from 'react';
import { Alert, Box, Chip, Container, Grid, Stack, Typography } from '@mui/material';
import Loader from '../components/Loader';
import NotificationCard from '../components/NotificationCard';
import { fetchNotifications } from '../api/notificationApi';
import { getPriorityScore, getTopPriorityNotifications } from '../utils/priorityHelper';

export default function PriorityInbox() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewedIds, setViewedIds] = useState(() => new Set(JSON.parse(localStorage.getItem('viewedNotifications') || '[]')));

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError('');
      try {
        const result = await fetchNotifications({ page: 1, limit: 50 });
        setNotifications(result.notifications || []);
        if (result.source === 'fallback') {
          setError('Using demo notifications because the remote API rejected the request.');
        }
      } catch (err) {
        setError(err?.message || 'Unable to calculate priority inbox.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const rankedNotifications = useMemo(() => getTopPriorityNotifications(notifications, 10), [notifications]);
  const scoreMap = useMemo(() => Object.fromEntries(rankedNotifications.map((notification) => [notification.ID, getPriorityScore(notification)])), [rankedNotifications]);

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
          <Typography variant="h4" fontWeight={700}>Priority Inbox</Typography>
          <Typography color="text.secondary">The top 10 notifications ranked by type weight and recency.</Typography>
        </Box>
        <Chip label="Top 10" color="secondary" />
      </Stack>

      {error && <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? <Loader /> : (
        <Grid container spacing={2}>
          {rankedNotifications.map((notification, index) => (
            <Grid item xs={12} md={6} key={notification.ID}>
              <Box sx={{ border: index < 3 ? '2px solid #ff9800' : '1px solid transparent', borderRadius: 2, p: 0.5 }}>
                <NotificationCard
                  notification={notification}
                  viewed={viewedIds.has(notification.ID)}
                  score={scoreMap[notification.ID]}
                  onClick={() => handleViewed(notification.ID)}
                />
              </Box>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}
