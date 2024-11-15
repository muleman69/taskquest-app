import React from 'react';
import { Gift, Clock } from 'lucide-react';
import { useRewardHistory } from '../hooks/useRewardHistory';
import { format } from 'date-fns';

interface RewardHistoryProps {
  isParent?: boolean;
  childId?: string | null;
}

export function RewardHistory({ isParent = false, childId = null }: RewardHistoryProps) {
  const { history, loading } = useRewardHistory(isParent, childId);

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
    switch (status) {
      case 'pending':
        return <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>Pending Approval</span>;
      case 'approved':
        return <span className={`${baseClasses} bg-green-100 text-green-800`}>Approved</span>;
      case 'denied':
        return <span className={`${baseClasses} bg-red-100 text-red-800`}>Denied</span>;
      default:
        return null;
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Date not available';
    
    try {
      // Handle Firestore Timestamp
      if (timestamp.toDate) {
        return format(timestamp.toDate(), 'PPp');
      }
      // Handle string dates
      return format(new Date(timestamp), 'PPp');
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-center p-6">
          <Clock className="animate-spin h-6 w-6 text-gray-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex items-center gap-2 mb-6">
        <Gift className="h-5 w-5" />
        <h2 className="text-xl font-bold">Reward History</h2>
      </div>

      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
        {history.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            No reward history yet
          </div>
        ) : (
          history.map((item) => (
            <div
              key={item.id}
              className="flex items-start justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="space-y-1">
                <h4 className="font-medium">{item.rewardTitle}</h4>
                <p className="text-sm text-gray-500">
                  {formatDate(item.claimedAt)}
                </p>
                <p className="text-sm font-medium text-purple-600">
                  {item.pointsCost || item.coinCost} coins
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                {getStatusBadge(item.status)}
                {isParent && item.childName && (
                  <p className="text-sm text-gray-500">
                    Claimed by {item.childName}
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}