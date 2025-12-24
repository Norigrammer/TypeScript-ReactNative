import { useState, useEffect, useCallback } from 'react';
import { getUnreadCount } from '../api/notifications';

export function useUnreadNotifications() {
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const count = await getUnreadCount();
      setUnreadCount(count);
    } catch {
      // エラー時は0を維持
    }
  }, []);

  useEffect(() => {
    fetchUnreadCount();

    // 30秒ごとに更新
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  return { unreadCount, refetch: fetchUnreadCount };
}
