import React from 'react';
import { Users, Award, Settings, UserPlus } from 'lucide-react';
import { TaskManager } from './TaskManager';
import { RewardManager } from './RewardManager';
import { ChildProgress } from './ChildProgress';
import { ManageChildren } from './ManageChildren';
import { Header } from '../Header';
import { NotificationPanel } from './NotificationPanel';

export function ParentDashboard() {
  const [activeTab, setActiveTab] = React.useState('children');

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <NotificationPanel />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Parent Dashboard</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <button
              onClick={() => setActiveTab('children')}
              className={`flex items-center p-4 rounded-xl transition-all ${
                activeTab === 'children' 
                  ? 'bg-purple-500 text-white' 
                  : 'bg-gray-50 text-gray-700 hover:bg-purple-50'
              }`}
            >
              <UserPlus className="w-6 h-6 mr-3" />
              <div className="text-left">
                <div className="font-semibold">Manage Children</div>
                <div className="text-sm opacity-80">Add/remove accounts</div>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('tasks')}
              className={`flex items-center p-4 rounded-xl transition-all ${
                activeTab === 'tasks' 
                  ? 'bg-purple-500 text-white' 
                  : 'bg-gray-50 text-gray-700 hover:bg-purple-50'
              }`}
            >
              <Settings className="w-6 h-6 mr-3" />
              <div className="text-left">
                <div className="font-semibold">Manage Tasks</div>
                <div className="text-sm opacity-80">Create and edit tasks</div>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('rewards')}
              className={`flex items-center p-4 rounded-xl transition-all ${
                activeTab === 'rewards' 
                  ? 'bg-purple-500 text-white' 
                  : 'bg-gray-50 text-gray-700 hover:bg-purple-50'
              }`}
            >
              <Award className="w-6 h-6 mr-3" />
              <div className="text-left">
                <div className="font-semibold">Manage Rewards</div>
                <div className="text-sm opacity-80">Set up rewards</div>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('progress')}
              className={`flex items-center p-4 rounded-xl transition-all ${
                activeTab === 'progress' 
                  ? 'bg-purple-500 text-white' 
                  : 'bg-gray-50 text-gray-700 hover:bg-purple-50'
              }`}
            >
              <Users className="w-6 h-6 mr-3" />
              <div className="text-left">
                <div className="font-semibold">Child Progress</div>
                <div className="text-sm opacity-80">Track achievements</div>
              </div>
            </button>
          </div>
        </div>
        {activeTab === 'children' && <ManageChildren />}
        {activeTab === 'tasks' && <TaskManager />}
        {activeTab === 'rewards' && <RewardManager />}
        {activeTab === 'progress' && <ChildProgress />}
      </div>
    </div>
  );
}