import React from 'react';

interface ActivityTableProps {
  address: string | undefined;
}

const ActivityTable: React.FC<ActivityTableProps> = ({ address }) => {
  // Mock activity data for demonstration
  const activities = [
    {
      id: 1,
      type: 'Supply',
      asset: 'MON',
      amount: '100.00',
      timestamp: '2024-01-15 14:30',
      txHash: '0x123...abc',
      status: 'Completed'
    },
    {
      id: 2,
      type: 'Borrow',
      asset: 'USDC',
      amount: '500.00',
      timestamp: '2024-01-14 09:15',
      txHash: '0x456...def',
      status: 'Completed'
    },
    {
      id: 3,
      type: 'Supply',
      asset: 'WBTC',
      amount: '0.5',
      timestamp: '2024-01-13 16:22',
      txHash: '0x789...ghi',
      status: 'Completed'
    },
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Supply': return 'text-lime-400 bg-lime-600/20 border-lime-600/30';
      case 'Borrow': return 'text-orange-400 bg-orange-600/20 border-orange-600/30';
      case 'Repay': return 'text-blue-400 bg-blue-600/20 border-blue-600/30';
      case 'Withdraw': return 'text-purple-400 bg-purple-600/20 border-purple-600/30';
      default: return 'text-gray-400 bg-gray-600/20 border-gray-600/30';
    }
  };

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-800/50 border-b border-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Asset</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Time</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">TX</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {activities.map((activity) => (
              <tr key={activity.id} className="hover:bg-gray-800/50 transition-colors duration-200">
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getTypeColor(activity.type)}`}>
                    {activity.type}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-6 w-6 bg-gray-700 rounded-full flex items-center justify-center mr-2">
                      <span className="text-xs font-medium text-white">{activity.asset[0]}</span>
                    </div>
                    <span className="text-sm text-white font-medium">{activity.asset}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-white font-medium">{activity.amount} {activity.asset}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                  {activity.timestamp}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-600/20 text-green-400 border border-green-600/30">
                    ✓ {activity.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <a 
                    href="#" 
                    className="text-lime-400 hover:text-lime-300 font-mono text-xs"
                    onClick={(e) => e.preventDefault()}
                  >
                    {activity.txHash}
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {activities.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <div className="text-4xl mb-2">📊</div>
          <div>No recent activity</div>
          <div className="text-sm mt-1">Start trading to see your activity here</div>
        </div>
      )}
    </div>
  );
};

export default ActivityTable;
