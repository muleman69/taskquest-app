import React from 'react';
import { Star, Trophy, Clock, Repeat } from 'lucide-react';
import type { Task } from '../types';

interface TaskCardProps {
  task: Task;
  onComplete: (taskId: string) => void;
}

export function TaskCard({ task, onComplete }: TaskCardProps) {
  const isCompletedToday = React.useMemo(() => {
    if (!task.lastCompletedAt) return false;
    const lastCompleted = new Date(task.lastCompletedAt);
    const today = new Date();
    return (
      lastCompleted.getDate() === today.getDate() &&
      lastCompleted.getMonth() === today.getMonth() &&
      lastCompleted.getFullYear() === today.getFullYear()
    );
  }, [task.lastCompletedAt]);

  const shouldShowCompleteButton = task.type === 'one-time' ? !task.completed : !isCompletedToday;

  return (
    <div 
      className={`
        relative overflow-hidden rounded-xl shadow-lg transition-all duration-300 transform hover:-translate-y-1
        ${isCompletedToday ? 'bg-green-50 border-2 border-green-500' : 'bg-white hover:shadow-xl'}
      `}
    >
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="text-xl font-bold text-gray-900">{task.title}</h3>
              {task.type === 'daily' && (
                <span className="flex items-center text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
                  <Repeat className="w-3 h-3 mr-1" />
                  Daily
                </span>
              )}
            </div>
            <p className="text-gray-600">{task.description}</p>
          </div>
          <div className="flex items-center space-x-2 text-yellow-500">
            <Star className="w-5 h-5 fill-current" />
            <span className="font-bold">{task.coinValue}</span>
          </div>
        </div>
        
        {task.lastCompletedAt && (
          <div className="mt-2 flex items-center text-sm text-gray-500">
            <Clock className="w-4 h-4 mr-1" />
            Last completed: {new Date(task.lastCompletedAt).toLocaleDateString()}
          </div>
        )}
        
        {shouldShowCompleteButton && (
          <button
            onClick={() => onComplete(task.id)}
            className="mt-4 w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2 px-4 rounded-lg
              font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg
              flex items-center justify-center space-x-2"
          >
            <Trophy className="w-5 h-5" />
            <span>Complete Task!</span>
          </button>
        )}
        
        {isCompletedToday && (
          <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
            {task.type === 'daily' ? 'Completed Today!' : 'Completed!'}
          </div>
        )}

        {task.type === 'daily' && isCompletedToday && (
          <div className="mt-4 text-sm text-gray-500 text-center">
            Come back tomorrow to complete this task again!
          </div>
        )}
      </div>
    </div>
  );
}