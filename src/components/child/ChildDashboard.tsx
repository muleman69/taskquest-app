import React, { useState, useEffect } from 'react';
import { Header } from '../Header';
import { TaskCard } from '../TaskCard';
import { RewardsGrid } from '../RewardsGrid';
import { Navigation } from '../Navigation';
import { RewardHistory } from '../RewardHistory';
import { Trophy, Star, Gift } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../hooks/useNotifications';
import { triggerConfetti } from '../../lib/firebase';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  doc, 
  getDoc, 
  writeBatch, 
  increment,
  getDocs
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import type { Task } from '../../types';

export function ChildDashboard() {
  const { currentUser } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [userCoins, setUserCoins] = useState(0);
  const [activeTab, setActiveTab] = useState<'tasks' | 'rewards'>('tasks');
  const { notifications } = useNotifications();

  // Fetch tasks and handle daily resets
  useEffect(() => {
    if (!currentUser) return;

    // Query for tasks assigned to this child
    const tasksQuery = query(
      collection(db, 'tasks'),
      where('assignedTo', 'array-contains', currentUser.uid)
    );

    // Listen for task updates
    const unsubscribe = onSnapshot(tasksQuery, (snapshot) => {
      const tasksData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Task[];
      setTasks(tasksData);
    });

    // Get user's current coins
    const fetchUserData = async () => {
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      if (userDoc.exists()) {
        setUserCoins(userDoc.data().coins || 0);
      }
    };

    // Check and reset daily tasks
    const resetDailyTasks = async () => {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

      const dailyTasksQuery = query(
        collection(db, 'tasks'),
        where('assignedTo', 'array-contains', currentUser.uid),
        where('type', '==', 'daily')
      );

      const snapshot = await getDocs(dailyTasksQuery);
      const batch = writeBatch(db);
      
      snapshot.docs.forEach(doc => {
        const lastCompletedAt = doc.data().lastCompletedAt;
        if (lastCompletedAt) {
          const lastCompletedDate = new Date(lastCompletedAt).getTime();
          if (lastCompletedDate < today) {
            batch.update(doc.ref, {
              completed: false,
              lastCompletedAt: null
            });
          }
        }
      });

      await batch.commit();
    };

    fetchUserData();
    resetDailyTasks();

    // Set up interval to check for resets (every minute)
    const interval = setInterval(resetDailyTasks, 60000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [currentUser]);

  // Effect to handle reward approval notifications
  useEffect(() => {
    const approvalNotification = notifications.find(
      n => n.type === 'reward_approved' && n.metadata?.showConfetti
    );

    if (approvalNotification) {
      triggerConfetti();
    }
  }, [notifications]);

  const handleCompleteTask = async (taskId: string) => {
    if (!currentUser) return;

    try {
      const taskRef = doc(db, 'tasks', taskId);
      const taskDoc = await getDoc(taskRef);
      
      if (!taskDoc.exists() || taskDoc.data().completed) return;

      const taskData = taskDoc.data();
      const coinValue = taskData.coinValue;

      // Start a batch write to ensure both updates happen together
      const batch = writeBatch(db);

      // Update task
      batch.update(taskRef, { 
        completed: true,
        lastCompletedAt: new Date().toISOString()
      });

      // Update user's coins
      const userRef = doc(db, 'users', currentUser.uid);
      batch.update(userRef, {
        coins: increment(coinValue),
        tasksCompleted: increment(1)
      });

      // Commit both updates
      await batch.commit();

      // Update local state for immediate feedback
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId 
            ? { ...task, completed: true, lastCompletedAt: new Date().toISOString() }
            : task
        )
      );
      setUserCoins(prev => prev + coinValue);

    } catch (error) {
      console.error('Error completing task:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold mb-2">
                  Welcome back!
                </h2>
                <p className="text-purple-100">Ready to conquer today's quests?</p>
              </div>
              <Trophy className="w-16 h-16 text-yellow-300" />
            </div>
            
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="bg-white/20 rounded-xl p-4">
                <div className="flex items-center space-x-2">
                  <Star className="w-5 h-5 text-yellow-300" />
                  <span className="font-medium">Your Coins</span>
                </div>
                <p className="text-2xl font-bold mt-2">{userCoins}</p>
              </div>
              
              <div className="bg-white/20 rounded-xl p-4">
                <div className="flex items-center space-x-2">
                  <Gift className="w-5 h-5 text-yellow-300" />
                  <span className="font-medium">Tasks Completed</span>
                </div>
                <p className="text-2xl font-bold mt-2">
                  {tasks.filter(t => t.completed).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        <Navigation activeTab={activeTab} onTabChange={setActiveTab} />

        {activeTab === 'tasks' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onComplete={handleCompleteTask}
              />
            ))}
            {tasks.length === 0 && (
              <div className="col-span-full text-center py-12 text-gray-500">
                No tasks assigned yet. Ask your parent to assign some tasks!
              </div>
            )}
          </div>
        )}

        {activeTab === 'rewards' && (
          <div className="space-y-8">
            <RewardsGrid userCoins={userCoins} />
            <RewardHistory isParent={false} />
          </div>
        )}
      </main>
    </div>
  );
}