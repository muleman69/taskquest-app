import React, { useState, useEffect } from 'react';
import { PlusCircle, Edit2, Trash2, Image } from 'lucide-react';
import { collection, addDoc, deleteDoc, doc, updateDoc, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import type { Reward } from '../../types';

// Preset images for common reward types
const PRESET_IMAGES = [
  {
    label: 'Extra Play Time',
    url: 'https://images.unsplash.com/photo-1493612276216-ee3925520721?auto=format&fit=crop&q=80&w=800&h=600',
  },
  {
    label: 'Special Dessert',
    url: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&q=80&w=800&h=600',
  },
  {
    label: 'Movie Night',
    url: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=800&h=600',
  },
  {
    label: 'Video Games',
    url: 'https://images.unsplash.com/photo-1580327332925-a10e6cb11baa?auto=format&fit=crop&q=80&w=800&h=600',
  },
  {
    label: 'Board Games',
    url: 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?auto=format&fit=crop&q=80&w=800&h=600',
  },
  {
    label: 'Art Supplies',
    url: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&q=80&w=800&h=600',
  },
  {
    label: 'Books',
    url: 'https://images.unsplash.com/photo-1524578271613-d550eacf6090?auto=format&fit=crop&q=80&w=800&h=600',
  },
  {
    label: 'Outdoor Activity',
    url: 'https://images.unsplash.com/photo-1472898965229-f9b06b9c9bbe?auto=format&fit=crop&q=80&w=800&h=600',
  },
];

interface RewardFormData {
  title: string;
  description: string;
  coinCost: string;
  image: string;
}

export function RewardManager() {
  const { currentUser } = useAuth();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editReward, setEditReward] = useState<Reward | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<RewardFormData>({
    title: '',
    description: '',
    coinCost: '100',
    image: PRESET_IMAGES[0].url
  });

  // Fetch rewards from Firestore
  useEffect(() => {
    if (!currentUser) return;

    const rewardsQuery = query(
      collection(db, 'rewards'),
      where('parentId', '==', currentUser.uid)
    );

    const unsubscribe = onSnapshot(rewardsQuery, (snapshot) => {
      const rewardsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Reward[];
      setRewards(rewardsData);
    }, (error) => {
      console.error('Error fetching rewards:', error);
      setError('Failed to load rewards. Please try again.');
    });

    return () => unsubscribe();
  }, [currentUser]);

  const handleAddReward = () => {
    setIsEditing(true);
    setEditReward(null);
    setFormData({
      title: '',
      description: '',
      coinCost: '100',
      image: PRESET_IMAGES[0].url
    });
  };

  const handleEditReward = (reward: Reward) => {
    setIsEditing(true);
    setEditReward(reward);
    setFormData({
      title: reward.title,
      description: reward.description,
      coinCost: reward.coinCost.toString(),
      image: reward.image || PRESET_IMAGES[0].url
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    try {
      const rewardData = {
        title: formData.title,
        description: formData.description,
        coinCost: parseInt(formData.coinCost) || 0,
        image: formData.image,
        parentId: currentUser.uid,
        createdAt: new Date().toISOString()
      };

      if (editReward) {
        await updateDoc(doc(db, 'rewards', editReward.id), rewardData);
      } else {
        await addDoc(collection(db, 'rewards'), rewardData);
      }
      setIsEditing(false);
      setError(null);
    } catch (error) {
      console.error('Error saving reward:', error);
      setError('Failed to save reward. Please try again.');
    }
  };

  const handleDelete = async (rewardId: string) => {
    if (!window.confirm('Are you sure you want to delete this reward?')) return;

    try {
      await deleteDoc(doc(db, 'rewards', rewardId));
      setError(null);
    } catch (error) {
      console.error('Error deleting reward:', error);
      setError('Failed to delete reward. Please try again.');
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-900">Reward Management</h3>
        <button
          onClick={handleAddReward}
          className="flex items-center space-x-2 bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors"
        >
          <PlusCircle className="w-5 h-5" />
          <span>Add Reward</span>
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {rewards.map(reward => (
          <div
            key={reward.id}
            className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
          >
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-lg overflow-hidden">
                <img
                  src={reward.image}
                  alt={reward.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">{reward.title}</h4>
                <p className="text-sm text-gray-600">{reward.description}</p>
                <div className="text-sm text-purple-600 mt-1">
                  Cost: {reward.coinCost} coins
                </div>
              </div>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => handleEditReward(reward)}
                className="p-2 text-gray-600 hover:text-purple-500 transition-colors"
              >
                <Edit2 className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleDelete(reward.id)}
                className="p-2 text-gray-600 hover:text-red-500 transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}

        {rewards.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No rewards created yet. Click "Add Reward" to create one.
          </div>
        )}
      </div>

      {isEditing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">
              {editReward ? 'Edit Reward' : 'Add New Reward'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows={3}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Coin Cost
                </label>
                <input
                  type="number"
                  value={formData.coinCost}
                  onChange={e => setFormData({ ...formData, coinCost: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  min="1"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Image
                </label>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  {PRESET_IMAGES.map((preset, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setFormData({ ...formData, image: preset.url })}
                      className={`relative aspect-video rounded-lg overflow-hidden border-2 transition-all ${
                        formData.image === preset.url
                          ? 'border-purple-500 ring-2 ring-purple-500'
                          : 'border-gray-200 hover:border-purple-300'
                      }`}
                    >
                      <img
                        src={preset.url}
                        alt={preset.label}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-end p-2">
                        <span className="text-white text-sm font-medium">
                          {preset.label}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
                >
                  {editReward ? 'Save Changes' : 'Create Reward'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}