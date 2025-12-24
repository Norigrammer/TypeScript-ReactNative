import { useState, useEffect, useCallback } from 'react';
import { getTotalUnreadCount } from '../api/chat';

export function useUnreadChats() {
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const count = await getTotalUnreadCount();
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
