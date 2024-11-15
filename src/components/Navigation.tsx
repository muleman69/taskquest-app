import React from 'react';
import { CheckSquare, Gift } from 'lucide-react';

interface NavigationProps {
  activeTab: 'tasks' | 'rewards';
  onTabChange: (tab: 'tasks' | 'rewards') => void;
}

export function Navigation({ activeTab, onTabChange }: NavigationProps) {
  return (
    <div className="flex space-x-4 mb-8">
      <button
        onClick={() => onTabChange('tasks')}
        className={`
          flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors
          ${activeTab === 'tasks'
            ? 'bg-purple-500 text-white'
            : 'bg-white text-gray-600 hover:bg-purple-50'}
        `}
      >
        <CheckSquare className="w-5 h-5" />
        <span>Tasks</span>
      </button>
      
      <button
        onClick={() => onTabChange('rewards')}
        className={`
          flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors
          ${activeTab === 'rewards'
            ? 'bg-purple-500 text-white'
            : 'bg-white text-gray-600 hover:bg-purple-50'}
        `}
      >
        <Gift className="w-5 h-5" />
        <span>Rewards</span>
      </button>
    </div>
  );
}