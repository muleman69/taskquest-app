import React, { useState } from 'react';
import { Bell, X, Check, XCircle } from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';
import { approveReward, denyReward } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';

export function NotificationPanel() {
  const [showPanel, setShowPanel] = useState(false);
  const { notifications, removeNotification } = useNotifications();
  const { currentUser } = useAuth();

  const handleApproveReward = async (notification: any) => {
    if (!currentUser || !notification.metadata) return;
    
    try {
      await approveReward(
        notification.metadata.claimId,
        currentUser.uid,
        notification.metadata.childId,
        notification.metadata.rewardTitle,
        notification.metadata.coinCost || 0
      );
      await removeNotification(notification.id);
      setShowPanel(false);
    } catch (error) {
      console.error('Error approving reward:', error);
    }
  };

  const handleDenyReward = async (notification: any) => {
    if (!currentUser || !notification.metadata) return;

    try {
      await denyReward(
        notification.metadata.claimId,
        currentUser.uid,
        notification.metadata.childId,
        notification.metadata.rewardTitle
      );
      await removeNotification(notification.id);
      setShowPanel(false);
    } catch (error) {
      console.error('Error denying reward:', error);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowPanel(true)}
        className="fixed top-4 right-4 bg-purple-600 text-white p-2 rounded-full shadow-lg hover:bg-purple-700"
      >
        <Bell className="h-6 w-6" />
        {notifications.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full h-5 w-5 text-xs flex items-center justify-center">
            {notifications.length}
          </span>
        )}
      </button>

      {showPanel && (
        <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-lg p-4 overflow-y-auto z-50">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Notifications</h2>
            <button onClick={() => setShowPanel(false)}>
              <X className="h-6 w-6" />
            </button>
          </div>

          {notifications.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No new notifications</p>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="bg-gray-50 p-4 rounded-lg"
                >
                  <h3 className="font-bold">{notification.title}</h3>
                  <p className="text-gray-600 mb-2">{notification.message}</p>
                  
                  {notification.type === 'reward_approval_request' && notification.metadata && (
                    <div className="flex space-x-2 mt-2">
                      <button
                        onClick={() => handleApproveReward(notification)}
                        className="flex items-center bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleDenyReward(notification)}
                        className="flex items-center bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Deny
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}