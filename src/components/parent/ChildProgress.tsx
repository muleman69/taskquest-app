import React, { useEffect, useState } from 'react';
import { Trophy, Star, Award, TrendingUp, User, Gift } from 'lucide-react';
import { collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';

interface ChildStats {
  id: string;
  name: string;
  coins: number;
  tasksCompleted: number;
  dailyStreak: number;
}

interface RewardClaim {
  id: string;
  childName: string;
  rewardName: string;
  coinCost: number;
  claimedAt: string;
}

export function ChildProgress() {
  const { currentUser } = useAuth();
  const [children, setChildren] = useState<ChildStats[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [rewardHistory, setRewardHistory] = useState<RewardClaim[]>([]);
  const [totalStats, setTotalStats] = useState({
    tasksCompleted: 0,
    coinsEarned: 0,
    rewardsClaimed: 0,
    maxStreak: 0
  });

  useEffect(() => {
    if (!currentUser) return;

    // Fetch children data
    const fetchChildren = async () => {
      const childrenQuery = query(
        collection(db, 'users'),
        where('parentId', '==', currentUser.uid)
      );

      const snapshot = await getDocs(childrenQuery);
      const childrenData = snapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name,
        coins: doc.data().coins || 0,
        tasksCompleted: doc.data().tasksCompleted || 0,
        dailyStreak: doc.data().dailyStreak || 0
      }));
      setChildren(childrenData);

      // Calculate total stats
      setTotalStats({
        tasksCompleted: childrenData.reduce((acc, child) => acc + child.tasksCompleted, 0),
        coinsEarned: childrenData.reduce((acc, child) => acc + child.coins, 0),
        rewardsClaimed: rewardHistory.length,
        maxStreak: Math.max(...childrenData.map(child => child.dailyStreak))
      });
    };

    // Listen for activity updates
    const activityQuery = query(
      collection(db, 'activity'),
      where('parentId', '==', currentUser.uid)
    );

    const unsubscribeActivity = onSnapshot(activityQuery, (snapshot) => {
      const activity = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate?.() || new Date()
        }))
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 10);
      setRecentActivity(activity);
    });

    // Fetch reward claims
    const fetchRewardClaims = async () => {
      const claimsQuery = query(
        collection(db, 'rewardClaims'),
        where('parentId', '==', currentUser.uid)
      );

      const snapshot = await getDocs(claimsQuery);
      const claims = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        } as RewardClaim))
        .sort((a, b) => new Date(b.claimedAt).getTime() - new Date(a.claimedAt).getTime());
      setRewardHistory(claims);
    };

    fetchChildren();
    fetchRewardClaims();

    return () => {
      unsubscribeActivity();
    };
  }, [currentUser]);

  return (
    <div className="space-y-6">
      {/* Weekly Overview */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Weekly Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-purple-50 rounded-xl p-4">
            <div className="flex items-center space-x-3">
              <Trophy className="w-6 h-6 text-purple-500" />
              <div>
                <div className="text-sm text-gray-600">Tasks Completed</div>
                <div className="text-2xl font-bold text-purple-700">{totalStats.tasksCompleted}</div>
              </div>
            </div>
          </div>
          <div className="bg-pink-50 rounded-xl p-4">
            <div className="flex items-center space-x-3">
              <Star className="w-6 h-6 text-pink-500" />
              <div>
                <div className="text-sm text-gray-600">Total Coins Earned</div>
                <div className="text-2xl font-bold text-pink-700">{totalStats.coinsEarned}</div>
              </div>
            </div>
          </div>
          <div className="bg-yellow-50 rounded-xl p-4">
            <div className="flex items-center space-x-3">
              <Award className="w-6 h-6 text-yellow-500" />
              <div>
                <div className="text-sm text-gray-600">Rewards Claimed</div>
                <div className="text-2xl font-bold text-yellow-700">{totalStats.rewardsClaimed}</div>
              </div>
            </div>
          </div>
          <div className="bg-green-50 rounded-xl p-4">
            <div className="flex items-center space-x-3">
              <TrendingUp className="w-6 h-6 text-green-500" />
              <div>
                <div className="text-sm text-gray-600">Best Daily Streak</div>
                <div className="text-2xl font-bold text-green-700">{totalStats.maxStreak} days</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Children Stats */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Children's Progress</h3>
        <div className="space-y-4">
          {children.map(child => (
            <div key={child.id} className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-purple-500" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{child.name}</h4>
                    <p className="text-sm text-gray-600">
                      {child.tasksCompleted} tasks completed · {child.dailyStreak} day streak
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-xl text-yellow-500">{child.coins} coins</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Reward Claims */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Recent Rewards Claimed</h3>
        <div className="space-y-4">
          {rewardHistory.map(claim => (
            <div key={claim.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                  <Gift className="w-5 h-5 text-yellow-500" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{claim.rewardName}</h4>
                  <p className="text-sm text-gray-600">
                    Claimed by {claim.childName} · {claim.coinCost} coins
                  </p>
                </div>
              </div>
              <div className="text-sm text-gray-500">
                {new Date(claim.claimedAt).toLocaleDateString()}
              </div>
            </div>
          ))}
          {rewardHistory.length === 0 && (
            <div className="text-center text-gray-500 py-4">
              No rewards have been claimed yet
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Recent Activity</h3>
        <div className="space-y-4">
          {recentActivity.map((activity) => (
            <div
              key={activity.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{activity.title}</h4>
                  <p className="text-sm text-gray-600">{activity.description}</p>
                </div>
              </div>
              <div className="text-sm text-gray-500">
                {activity.timestamp.toLocaleTimeString()}
              </div>
            </div>
          ))}
          {recentActivity.length === 0 && (
            <div className="text-center text-gray-500 py-4">
              No recent activity
            </div>
          )}
        </div>
      </div>
    </div>
  );
}