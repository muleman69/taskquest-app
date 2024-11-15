import React, { useState } from 'react';
import { Bell, X } from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';
import { approveReward, denyReward } from '../lib/firebase';

export function NotificationSystem() {
  const [showNotifications, setShowNotifications] = useState(false);
  const { notifications, removeNotification } = useNotifications();

  const handleApproveReward = async (redemptionId: string, notification: any) => {
    try {
      await approveReward(
        redemptionId,
        notification.metadata.parentId,
        notification.metadata.childId,
        notification.metadata.rewardTitle
      );
      await removeNotification(notification.id);
    } catch (error) {
      console.error('Error approving reward:', error);
    }
  };

  const handleDenyReward = async (redemptionId: string, notification: any) => {
    try {
      await denyReward(
        redemptionId,
        notification.metadata.parentId,
        notification.metadata.childId,
        notification.metadata.rewardTitle
      );
      await removeNotification(notification.id);
    } catch (error) {
      console.error('Error denying reward:', error);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className="fixed top-4 right-4 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-shadow"
      >
        <Bell className="h-6 w-6" />
        {notifications.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
            {notifications.length}
          </span>
        )}
      </button>

      {showNotifications && (
        <div className="fixed top-16 right-4 w-80 max-h-[80vh] overflow-y-auto bg-white rounded-lg shadow-xl p-4 space-y-2">
          {notifications.length === 0 ? (
            <p className="text-center text-gray-500 py-4">No new notifications</p>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className="relative bg-gray-50 rounded-lg p-4 border border-gray-200"
              >
                <button
                  onClick={() => removeNotification(notification.id)}
                  className="absolute top-2 right-2"
                >
                  <X className="h-4 w-4 text-gray-500 hover:text-gray-700" />
                </button>
                <h3 className="font-semibold text-gray-900">{notification.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                {notification.type === 'reward_approval_request' && (
                  <div className="mt-2 flex gap-2">
                    <button
                      onClick={() => handleApproveReward(notification.metadata.redemptionId, notification)}
                      className="bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600 text-sm"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleDenyReward(notification.metadata.redemptionId, notification)}
                      className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 text-sm"
                    >
                      Deny
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </>
  );
}