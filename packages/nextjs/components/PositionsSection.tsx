import React from 'react';
import { formatUnits } from 'viem';
import { useScaffoldReadContract } from '~~/hooks/scaffold-eth';

interface PositionsSectionProps {
  address: string | undefined;
}

const ASSET_NAMES = ['MON', 'WBTC', 'USDC'];
const ASSET_DECIMALS = [18, 8, 6];

const PositionsSection: React.FC<PositionsSectionProps> = ({ address }) => {
  // Supply positions
  const { data: monSupplyPosition } = useScaffoldReadContract({
    contractName: "IplikciFinance",
    functionName: "getSupplyPosition",
    args: [address, 0],
  });

  const { data: wbtcSupplyPosition } = useScaffoldReadContract({
    contractName: "IplikciFinance", 
    functionName: "getSupplyPosition",
    args: [address, 1],
  });

  const { data: usdcSupplyPosition } = useScaffoldReadContract({
    contractName: "IplikciFinance",
    functionName: "getSupplyPosition", 
    args: [address, 2],
  });

  // Borrow position
  const { data: borrowPosition } = useScaffoldReadContract({
    contractName: "IplikciFinance",
    functionName: "getBorrowPosition",
    args: [address],
  });

  const formatAssetAmount = (amount: bigint | undefined, decimals: number) => {
    if (!amount) return '0.00';
    return parseFloat(formatUnits(amount, decimals)).toFixed(2);
  };

  const supplyPositions = [
    { asset: 'MON', amount: monSupplyPosition?.[0], earned: monSupplyPosition?.[1], decimals: 18 },
    { asset: 'WBTC', amount: wbtcSupplyPosition?.[0], earned: wbtcSupplyPosition?.[1], decimals: 8 },
    { asset: 'USDC', amount: usdcSupplyPosition?.[0], earned: usdcSupplyPosition?.[1], decimals: 6 },
  ].filter(pos => pos.amount && pos.amount > 0n);

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-white mb-6">Positions</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Supply Positions */}
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Supply Positions</h3>
            <span className="text-sm text-gray-400">{supplyPositions.length} active</span>
          </div>
          
          {supplyPositions.length > 0 ? (
            <div className="space-y-3">
              {supplyPositions.map((position) => (
                <div key={position.asset} className="flex items-center justify-between py-3 px-4 bg-gray-800/50 rounded-lg border border-gray-700">
                  <div>
                    <div className="font-medium text-white">{position.asset}</div>
                    <div className="text-sm text-gray-400">
                      {formatAssetAmount(position.amount, position.decimals)} {position.asset}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-lime-400">+{formatAssetAmount(position.earned, position.decimals)}</div>
                    <div className="text-xs text-gray-400">earned</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <div className="text-4xl mb-2">💰</div>
              <div>No supply positions</div>
              <div className="text-sm mt-1">Start supplying to earn yield</div>
            </div>
          )}
        </div>

        {/* Borrow Positions */}
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Borrow Positions</h3>
            <span className="text-sm text-gray-400">{borrowPosition && borrowPosition[3] > 0n ? '1 active' : '0 active'}</span>
          </div>
          
          {borrowPosition && borrowPosition[3] > 0n ? (
            <div className="space-y-3">
              <div className="p-4 bg-gray-800/50 rounded-lg border border-orange-500/30">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-white">{ASSET_NAMES[Number(borrowPosition[0])]}</div>
                    <div className="text-sm text-gray-400">
                      Borrowed: {formatAssetAmount(borrowPosition[3], ASSET_DECIMALS[Number(borrowPosition[0])])} {ASSET_NAMES[Number(borrowPosition[0])]}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-orange-400">
                      Collateral: {formatAssetAmount(borrowPosition[2], ASSET_DECIMALS[Number(borrowPosition[1])])} {ASSET_NAMES[Number(borrowPosition[1])]}
                    </div>
                    <div className="text-xs text-gray-400">locked</div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <div className="text-4xl mb-2">💳</div>
              <div>No borrow positions</div>
              <div className="text-sm mt-1">Borrow against your collateral</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PositionsSection;
