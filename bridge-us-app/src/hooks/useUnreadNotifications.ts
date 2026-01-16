import { useState, useEffect } from 'react';
import { subscribeUnreadCount } from '../api/notifications-firebase';
import { useAuth } from '../contexts/AuthContext';

export function useUnreadNotifications() {
  const { isLoggedIn, user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!isLoggedIn || !user) {
      setUnreadCount(0);
      return;
    }

    const unsubscribe = subscribeUnreadCount(user.id, (count) => {
      setUnreadCount(count);
    });

    return () => unsubscribe();
  }, [isLoggedIn, user]);

  return { unreadCount };
}
