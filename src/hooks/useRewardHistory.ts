import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';

interface RewardClaim {
  id: string;
  rewardTitle: string;
  pointsCost: number; // Updated to match Firestore
  status: 'pending' | 'approved' | 'denied';
  claimedAt: any;
  childName?: string;
  parentId: string;
  childId: string;
  approvedAt?: string;
  imageUrl?: string;
  rewardId: string;
}

export function useRewardHistory(isParent = false, childId?: string | null) {
  const [history, setHistory] = useState<RewardClaim[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    let rewardsQuery;
    try {
      if (isParent) {
        const queryConstraints = [
          where('parentId', '==', currentUser.uid),
          orderBy('claimedAt', 'desc')
        ];
        
        if (childId) {
          queryConstraints.splice(1, 0, where('childId', '==', childId));
        }
        
        rewardsQuery = query(
          collection(db, 'rewardClaims'),
          ...queryConstraints
        );
      } else {
        rewardsQuery = query(
          collection(db, 'rewardClaims'),
          where('childId', '==', currentUser.uid),
          orderBy('claimedAt', 'desc')
        );
      }

      const unsubscribe = onSnapshot(rewardsQuery, 
        (snapshot) => {
          const historyData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as RewardClaim[];
          setHistory(historyData);
          setLoading(false);
        },
        (error) => {
          console.error('Error fetching reward history:', error);
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (error) {
      console.error('Error setting up reward history listener:', error);
      setLoading(false);
    }
  }, [currentUser, childId, isParent]);

  return { history, loading };
}