import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db, markNotificationAsRead, triggerConfetti } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';

export function useNotifications() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) return;

    const notificationsQuery = query(
      collection(db, 'notifications'),
      where('userId', '==', currentUser.uid),
      where('read', '==', false),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(notificationsQuery, (snapshot) => {
      const newNotifications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Check for reward approval notifications and trigger confetti
      const approvalNotification = newNotifications.find(
        n => n.type === 'reward_approved' && n.metadata?.showConfetti
      );

      if (approvalNotification) {
        triggerConfetti();
        // Mark the notification as read after showing confetti
        markNotificationAsRead(approvalNotification.id);
      }

      setNotifications(newNotifications);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const removeNotification = async (notificationId: string) => {
    await markNotificationAsRead(notificationId);
  };

  return { notifications, removeNotification };
}