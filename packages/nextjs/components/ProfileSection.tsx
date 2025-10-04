import React from 'react';
import { Address } from '~~/components/scaffold-eth';
import { useScaffoldReadContract } from '~~/hooks/scaffold-eth';

interface ProfileSectionProps {
  address: string | undefined;
}

const ProfileSection: React.FC<ProfileSectionProps> = ({ address }) => {
  const { data: creditScore } = useScaffoldReadContract({
    contractName: "IplikciFinance",
    functionName: "creditScores",
    args: [address],
  });

  // Mock data for demonstration
  const profileData = {
    totalSupply: '$12,450.00',
    totalBorrow: '$3,200.00',
    utilizationRate: '25.7%',
    creditScore: creditScore?.toString() || '750',
  };

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-white mb-6">Profile</h2>
      <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Wallet Address */}
          <div className="lg:col-span-1">
            <div className="text-sm text-gray-400 mb-1">Wallet Address</div>
            <div className="flex items-center">
              <Address address={address} />
            </div>
          </div>

          {/* Total Supply */}
          <div>
            <div className="text-sm text-gray-400 mb-1">Total Supply Value</div>
            <div className="text-2xl font-bold text-lime-400">{profileData.totalSupply}</div>
          </div>

          {/* Total Borrow */}
          <div>
            <div className="text-sm text-gray-400 mb-1">Total Borrow Value</div>
            <div className="text-2xl font-bold text-orange-400">{profileData.totalBorrow}</div>
          </div>

          {/* Credit Score */}
          <div>
            <div className="text-sm text-gray-400 mb-1">Credit Score</div>
            <div className="flex items-center space-x-2">
              <div className="text-2xl font-bold text-white">{profileData.creditScore}</div>
              <div className="text-xs bg-lime-600/20 text-lime-400 px-2 py-1 rounded-full border border-lime-600/30">
                Good
              </div>
            </div>
          </div>
        </div>

        {/* Utilization Rate */}
        <div className="mt-4 pt-4 border-t border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Portfolio Utilization</span>
            <span className="text-sm text-gray-300">{profileData.utilizationRate}</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-lime-400 to-lime-600 h-2 rounded-full transition-all duration-300"
              style={{ width: '25.7%' }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSection;
