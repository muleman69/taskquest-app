import React from 'react';
import { Coins, Gift } from 'lucide-react';
import type { Reward } from '../types';

interface RewardCardProps {
  reward: Reward;
  userCoins: number;
  onRedeem: (rewardId: string) => void;
}

export function RewardCard({ reward, userCoins, onRedeem }: RewardCardProps) {
  const canAfford = userCoins >= reward.coinCost;

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:-translate-y-1">
      <div className="h-48 w-full overflow-hidden">
        <img 
          src={reward.image} 
          alt={reward.title}
          className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-300"
        />
      </div>
      
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{reward.title}</h3>
        <p className="text-gray-600 mb-4">{reward.description}</p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-yellow-500">
            <Coins className="w-5 h-5" />
            <span className="font-bold">{reward.coinCost}</span>
          </div>
          
          <button
            onClick={() => onRedeem(reward.id)}
            disabled={!canAfford}
            className={`
              flex items-center space-x-2 px-4 py-2 rounded-lg font-medium
              transition-all duration-300 ${
                canAfford
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg transform hover:scale-105'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }
            `}
          >
            <Gift className="w-5 h-5" />
            <span>{canAfford ? 'Redeem!' : 'Not enough coins'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}