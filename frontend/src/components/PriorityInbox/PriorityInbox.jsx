import { useState, useEffect } from 'react';
import {
  Box, Typography, Alert, Slider, Stack, Paper, Chip
} from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import { fetchNotifications } from '../../services/api';
import { getTopNPriority } from '../../utils/prioritySort';
import NotificationCard from '../common/NotificationCard';
import LoadingSpinner from '../common/LoadingSpinner';

export default function PriorityInbox() {
  const [topN, setTopN] = useState(10);
  const [allNotifications, setAllNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewedIds, setViewedIds] = useState(() => {
    try { return new Set(JSON.parse(sessionStorage.getItem('viewedNotifications') || '[]')); }
    catch { return new Set(); }
  });

  // Fetch all pages on mount
  useEffect(() => {
    let cancelled = false;
    async function loadAll() {
      setLoading(true);
      setError(null);
      try {
        const collected = [];
        let page = 1;
        while (true) {
          const data = await fetchNotifications({ page, limit: 100 });
          const batch = data.notifications || [];
          if (batch.length === 0) break;
          collected.push(...batch);
          if (batch.length < 100) break;
          page++;
        }
        if (!cancelled) setAllNotifications(collected);
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load notifications');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadAll();
    return () => { cancelled = true; };
  }, []);

  const topNotifications = getTopNPriority(allNotifications, topN);

  const markViewed = (id) => {
    setViewedIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      try { sessionStorage.setItem('viewedNotifications', JSON.stringify([...next])); } catch {}
      return next;
    });
  };

  return (
    <Box>
      <Stack direction="row" alignItems="center" gap={1} mb={1}>
        <StarIcon color="warning" />
        <Typography variant="h5" fontWeight={700}>Priority Inbox</Typography>
      </Stack>
      <Typography variant="body2" color="text.secondary" mb={2}>
        Shows top notifications ranked by type weight × recency. Placement &gt; Result &gt; Event.
      </Typography>

      <Paper sx={{ p: 2, mb: 3 }} elevation={0} variant="outlined">
        <Typography variant="body2" gutterBottom>
          Show top <strong>{topN}</strong> notifications
        </Typography>
        <Slider
          value={topN}
          min={5} max={20} step={5}
          marks={[{ value: 5, label: '5' }, { value: 10, label: '10' }, { value: 15, label: '15' }, { value: 20, label: '20' }]}
          onChange={(_, val) => setTopN(val)}
          color="warning"
          sx={{ maxWidth: 300 }}
        />
      </Paper>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {loading && <LoadingSpinner message="Loading all notifications for priority scoring..." />}

      {!loading && allNotifications.length > 0 && (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
          Scored {allNotifications.length} notifications. Showing top {topN}.
        </Typography>
      )}

      {!loading && topNotifications.map((notif, i) => (
        <Stack key={notif.ID} direction="row" alignItems="flex-start" gap={1} onClick={() => markViewed(notif.ID)}>
          <Chip label={`#${i + 1}`} size="small" sx={{ mt: 1.5, minWidth: 36 }} />
          <Box sx={{ flex: 1 }}>
            <NotificationCard
              notification={notif}
              isNew={!viewedIds.has(notif.ID)}
              score={notif._score}
            />
          </Box>
        </Stack>
      ))}
    </Box>
  );
}
