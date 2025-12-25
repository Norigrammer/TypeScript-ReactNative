import { useState, useEffect } from 'react';
import { subscribeUnreadChatCount } from '../api/chat-firebase';
import { useAuth } from '../contexts/AuthContext';

export function useUnreadChats() {
  const { isLoggedIn, user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!isLoggedIn || !user) {
      setUnreadCount(0);
      return;
    }

    const unsubscribe = subscribeUnreadChatCount(user.id, (count) => {
      setUnreadCount(count);
    });

    return () => unsubscribe();
  }, [isLoggedIn, user]);

  return { unreadCount };
}
