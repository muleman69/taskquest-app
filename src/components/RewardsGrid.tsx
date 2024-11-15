import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { addDoc, collection, query, where, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { motion } from 'framer-motion';

interface Reward {
  id: string;
  title: string;
  description: string;
  coinCost: number;
  image?: string;
  parentId: string;
}

export function RewardsGrid({ userCoins }: { userCoins: number }) {
  const { currentUser, userData } = useAuth();
  const [claimingRewardId, setClaimingRewardId] = useState<string | null>(null);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Fetch rewards
  useEffect(() => {
    if (!currentUser || !userData?.parentId) return;

    const rewardsQuery = query(
      collection(db, 'rewards'),
      where('parentId', '==', userData.parentId)
    );

    const unsubscribe = onSnapshot(rewardsQuery, (snapshot) => {
      const rewardsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Reward[];
      setRewards(rewardsData);
    }, (error) => {
      console.error('Error fetching rewards:', error);
      setError('Failed to load rewards');
    });

    return () => unsubscribe();
  }, [currentUser, userData]);

  const handleClaimReward = async (reward: Reward) => {
    if (!currentUser || !userData) {
      setError('Please log in to claim rewards');
      return;
    }

    if (userCoins < reward.coinCost) {
      setError('Not enough coins to claim this reward');
      return;
    }
    
    setClaimingRewardId(reward.id);
    setError(null);
    
    try {
      // Create the reward claim
      const claimRef = await addDoc(collection(db, 'rewardClaims'), {
        rewardId: reward.id,
        rewardTitle: reward.title,
        childId: currentUser.uid,
        childName: userData.name,
        parentId: userData.parentId,
        coinCost: reward.coinCost,
        status: 'pending',
        claimedAt: serverTimestamp(),
        imageUrl: reward.image || null
      });

      // Create notification for parent
      await addDoc(collection(db, 'notifications'), {
        userId: userData.parentId,
        title: 'New Reward Claim',
        message: `${userData.name} wants to claim "${reward.title}"`,
        type: 'reward_approval_request',
        metadata: {
          childId: currentUser.uid,
          childName: userData.name,
          rewardId: reward.id,
          rewardTitle: reward.title,
          claimId: claimRef.id,
          coinCost: reward.coinCost
        },
        read: false,
        createdAt: serverTimestamp()
      });

      setError('Reward claim sent for approval!');
    } catch (error) {
      console.error('Error claiming reward:', error);
      setError('Failed to claim reward. Please try again.');
    } finally {
      setClaimingRewardId(null);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className={`p-4 rounded-lg ${
          error.includes('sent for approval')
            ? 'bg-green-50 text-green-800'
            : 'bg-red-50 text-red-800'
        }`}>
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {rewards.map((reward) => (
          <motion.div
            key={reward.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg overflow-hidden"
          >
            {reward.image && (
              <div className="w-full h-48 relative">
                <img 
                  src={reward.image} 
                  alt={reward.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">{reward.title}</h3>
              <p className="text-gray-600 mb-4">{reward.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-purple-600 font-bold">{reward.coinCost} coins</span>
                <button
                  onClick={() => handleClaimReward(reward)}
                  disabled={userCoins < reward.coinCost || claimingRewardId === reward.id}
                  className={`px-4 py-2 rounded-lg font-medium transition-all
                    ${userCoins >= reward.coinCost 
                      ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }
                    ${claimingRewardId === reward.id ? 'opacity-50 cursor-wait' : ''}
                  `}
                >
                  {claimingRewardId === reward.id 
                    ? 'Requesting...' 
                    : userCoins < reward.coinCost 
                      ? 'Not Enough Coins' 
                      : 'Claim Reward'
                  }
                </button>
              </div>
            </div>
          </motion.div>
        ))}

        {rewards.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-500">
            <p className="text-lg font-medium">No rewards available yet</p>
            <p className="text-sm">Ask your parent to add some rewards!</p>
          </div>
        )}
      </div>
    </div>
  );
}