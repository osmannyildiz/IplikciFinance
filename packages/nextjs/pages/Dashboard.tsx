import React from "react";
import ActivityTable from "../components/ActivityTable";
import HeroSection from "../components/HeroSection";
import PositionsSection from "../components/PositionsSection";
import ProfileSection from "../components/ProfileSection";
import { useAccount } from "wagmi";

const Dashboard: React.FC = () => {
  const { address, isConnected } = useAccount();

  if (!isConnected) {
    return <HeroSection />;
  }

  return (
    <div className="pt-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-gray-400">Monitor your lending activity and portfolio</p>
        </div>

        {/* Profile Section */}
        <ProfileSection address={address} />

        {/* Positions Section */}
        <PositionsSection address={address} />

        {/* Recent Activity */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-white mb-6">Recent Activity</h2>
          <ActivityTable address={address} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
