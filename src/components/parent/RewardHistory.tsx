import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from 'date-fns';
import { Gift, Clock, CheckCircle, XCircle } from 'lucide-react';

const RewardHistory = ({ isParent = false, childId = null }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, [childId]);

  const fetchHistory = async () => {
    try {
      const endpoint = isParent 
        ? `/api/parent/reward-history${childId ? `?childId=${childId}` : ''}`
        : '/api/child/reward-history';
      
      const response = await fetch(endpoint);
      const data = await response.json();
      
      if (data.success) {
        setHistory(data.history);
      }
    } catch (error) {
      console.error('Error fetching reward history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Pending Approval</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-100 text-green-800">Approved</Badge>;
      case 'denied':
        return <Badge variant="outline" className="bg-red-100 text-red-800">Denied</Badge>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <Clock className="animate-spin h-6 w-6 text-gray-400" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="h-5 w-5" />
          Reward History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          {history.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No reward history yet
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="space-y-1">
                    <h4 className="font-medium">{item.reward_title}</h4>
                    <p className="text-sm text-gray-500">
                      {format(new Date(item.created_at), 'PPp')}
                    </p>
                    {item.points_spent && (
                      <p className="text-sm font-medium text-purple-600">
                        {item.points_spent} coins
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {getStatusBadge(item.status)}
                    {isParent && item.status === 'pending' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApprove(item.id)}
                          className="text-green-600 hover:text-green-700"
                        >
                          <CheckCircle className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDeny(item.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <XCircle className="h-5 w-5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default RewardHistory;