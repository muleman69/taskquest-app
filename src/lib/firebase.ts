import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, query, where, onSnapshot, addDoc, updateDoc, doc, serverTimestamp, increment, writeBatch } from 'firebase/firestore';
import confetti from 'canvas-confetti';

const firebaseConfig = {
  apiKey: "AIzaSyBqJWp6Hy2ok68VA8JKeC17rW8tmJPOwFI",
  authDomain: "task-quest-c14e0.firebaseapp.com",
  projectId: "task-quest-c14e0",
  storageBucket: "task-quest-c14e0.firebasestorage.app",
  messagingSenderId: "446574499257",
  appId: "1:446574499257:web:26c5c288044d8e667b5268",
  measurementId: "G-TL5Z7P500E"
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);

// Notification functions
export const createNotification = async (userId: string, notification: {
  title: string;
  message: string;
  type: string;
  metadata?: any;
}) => {
  try {
    await addDoc(collection(db, 'notifications'), {
      userId,
      ...notification,
      read: false,
      createdAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

export const markNotificationAsRead = async (notificationId: string) => {
  try {
    await updateDoc(doc(db, 'notifications', notificationId), {
      read: true
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

// Reward functions
export const approveReward = async (redemptionId: string, parentId: string, childId: string, rewardTitle: string, coinCost: number) => {
  const batch = writeBatch(db);

  try {
    // Update reward claim status
    const claimRef = doc(db, 'rewardClaims', redemptionId);
    batch.update(claimRef, {
      status: 'approved',
      approvedAt: serverTimestamp()
    });

    // Deduct coins from child's account
    const childRef = doc(db, 'users', childId);
    batch.update(childRef, {
      coins: increment(-coinCost)
    });

    // Create notification for child
    const notificationRef = doc(collection(db, 'notifications'));
    batch.set(notificationRef, {
      userId: childId,
      title: '🎉 Reward Approved!',
      message: `Your reward "${rewardTitle}" has been approved! ${coinCost} coins have been deducted.`,
      type: 'reward_approved',
      read: false,
      metadata: {
        rewardTitle,
        coinCost,
        showConfetti: true
      },
      createdAt: serverTimestamp()
    });

    await batch.commit();
  } catch (error) {
    console.error('Error approving reward:', error);
    throw error;
  }
};

export const denyReward = async (redemptionId: string, parentId: string, childId: string, rewardTitle: string) => {
  const batch = writeBatch(db);

  try {
    // Update reward claim status
    const claimRef = doc(db, 'rewardClaims', redemptionId);
    batch.update(claimRef, {
      status: 'denied',
      deniedAt: serverTimestamp()
    });

    // Create notification for child
    const notificationRef = doc(collection(db, 'notifications'));
    batch.set(notificationRef, {
      userId: childId,
      title: 'Reward Request Denied',
      message: `Your request for "${rewardTitle}" was not approved.`,
      type: 'reward_denied',
      read: false,
      createdAt: serverTimestamp()
    });

    await batch.commit();
  } catch (error) {
    console.error('Error denying reward:', error);
    throw error;
  }
};

// Confetti animation
export const triggerConfetti = () => {
  const duration = 3000;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

  const randomInRange = (min: number, max: number) => {
    return Math.random() * (max - min) + min;
  };

  const interval: any = setInterval(() => {
    const particleCount = 50;

    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
    });

    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
    });
  }, 250);

  setTimeout(() => {
    clearInterval(interval);
  }, duration);
};