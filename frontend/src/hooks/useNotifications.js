import { useState, useEffect, useCallback } from 'react';
import { fetchNotifications } from '../services/api';

export function useNotifications({ page = 1, limit = 20, notification_type = '' } = {}) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [viewedIds, setViewedIds] = useState(() => {
    try {
      const stored = sessionStorage.getItem('viewedNotifications');
      return new Set(stored ? JSON.parse(stored) : []);
    } catch { return new Set(); }
  });

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchNotifications({ page, limit, notification_type });
      const fetched = data.notifications || [];
      setNotifications(fetched);
      setHasMore(fetched.length === limit);
    } catch (err) {
      setError(err.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, [page, limit, notification_type]);

  useEffect(() => { load(); }, [load]);

  const markViewed = useCallback((id) => {
    setViewedIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      try { sessionStorage.setItem('viewedNotifications', JSON.stringify([...next])); } catch {}
      return next;
    });
  }, []);

  return { notifications, loading, error, hasMore, viewedIds, markViewed, reload: load };
}
