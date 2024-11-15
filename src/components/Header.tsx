import React from 'react';
import { Menu, User, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function Header() {
  const { userData, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <header className="bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button className="lg:hidden">
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold">TaskQuest</h1>
        </div>
        
        <div className="flex items-center space-x-6">
          {userData?.role === 'child' && userData.coins !== undefined && (
            <div className="flex items-center bg-white/20 rounded-full px-4 py-2">
              <span className="text-yellow-300 font-bold">{userData.coins}</span>
              <span className="ml-2">coins</span>
            </div>
          )}
          
          <div className="flex items-center space-x-2">
            <User className="w-5 h-5" />
            <span className="font-medium">{userData?.name}</span>
          </div>
          
          <button 
            onClick={handleLogout}
            className="flex items-center space-x-1 hover:text-yellow-200 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}