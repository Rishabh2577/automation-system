import React, { useState, useEffect } from 'react';

interface Activity {
  action: 'generation' | 'download';
  timestamp: string;
  user: {
    email: string;
    name: string;
  };
  aspectRatio: string;
  imageCount: number;
  videoUrl?: string;
}

const AdminView: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [filter, setFilter] = useState<'all' | 'generation' | 'download'>('all');

  useEffect(() => {
    // Load activity history from localStorage
    const history = JSON.parse(localStorage.getItem('user_activity_history') || '[]');
    setActivities(history.reverse()); // Show most recent first
  }, []);

  const filteredActivities = activities.filter(activity => 
    filter === 'all' || activity.action === filter
  );

  const clearHistory = () => {
    if (confirm('Are you sure you want to clear all activity history?')) {
      localStorage.removeItem('user_activity_history');
      setActivities([]);
    }
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString();
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold gradient-text mb-2">Admin Dashboard</h1>
            <p className="text-gray-400">User Activity History & Analytics</p>
          </div>
          <button
            onClick={clearHistory}
            className="px-4 py-2 bg-red-500/20 text-red-400 rounded-xl hover:bg-red-500/30 transition-colors border border-red-500/30"
          >
            Clear History
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="glass p-6 rounded-2xl">
            <div className="text-gray-400 text-sm mb-1">Total Activities</div>
            <div className="text-3xl font-bold">{activities.length}</div>
          </div>
          <div className="glass p-6 rounded-2xl">
            <div className="text-gray-400 text-sm mb-1">Video Generations</div>
            <div className="text-3xl font-bold text-blue-400">
              {activities.filter(a => a.action === 'generation').length}
            </div>
          </div>
          <div className="glass p-6 rounded-2xl">
            <div className="text-gray-400 text-sm mb-1">Downloads</div>
            <div className="text-3xl font-bold text-green-400">
              {activities.filter(a => a.action === 'download').length}
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          {(['all', 'generation', 'download'] as const).map(type => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${
                filter === type
                  ? 'bg-white text-black'
                  : 'glass text-gray-400 hover:text-white'
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>

        {/* Activity Table */}
        <div className="glass rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Format
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Images
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredActivities.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      No activity recorded yet
                    </td>
                  </tr>
                ) : (
                  filteredActivities.map((activity, index) => (
                    <tr key={index} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {formatDate(activity.timestamp)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                            activity.action === 'generation'
                              ? 'bg-blue-500/20 text-blue-400'
                              : 'bg-green-500/20 text-green-400'
                          }`}
                        >
                          {activity.action === 'generation' ? '🎬 Generation' : '⬇️ Download'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="font-medium text-white">{activity.user.name}</div>
                        <div className="text-gray-400 text-xs">{activity.user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {activity.aspectRatio}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {activity.imageCount}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Export Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={() => {
              const dataStr = JSON.stringify(activities, null, 2);
              const dataBlob = new Blob([dataStr], { type: 'application/json' });
              const url = URL.createObjectURL(dataBlob);
              const link = document.createElement('a');
              link.href = url;
              link.download = `activity-history-${new Date().toISOString()}.json`;
              link.click();
              URL.revokeObjectURL(url);
            }}
            className="px-6 py-3 bg-white text-black font-bold rounded-xl hover:scale-105 transition-all"
          >
            📥 Export JSON
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminView;

