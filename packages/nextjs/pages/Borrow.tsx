import React from 'react';
import Link from 'next/link';
import { useScaffoldReadContract } from '~~/hooks/scaffold-eth';
import { formatUnits } from 'viem';

const Borrow: React.FC = () => {
  // Get liquidity for all assets
  const { data: monLiquidity } = useScaffoldReadContract({
    contractName: "IplikciFinance",
    functionName: "getAvailableLiquidity",
    args: [0],
  });

  const { data: wbtcLiquidity } = useScaffoldReadContract({
    contractName: "IplikciFinance",
    functionName: "getAvailableLiquidity",
    args: [1],
  });

  const { data: usdcLiquidity } = useScaffoldReadContract({
    contractName: "IplikciFinance",
    functionName: "getAvailableLiquidity",
    args: [2],
  });

  const { data: borrowFeeRate } = useScaffoldReadContract({
    contractName: "IplikciFinance",
    functionName: "borrowFeeBps",
  });

  const formatAssetAmount = (amount: bigint | undefined, decimals: number) => {
    if (!amount) return '0';
    return parseFloat(formatUnits(amount, decimals)).toFixed(2);
  };

  const assets = [
    {
      name: 'MON',
      symbol: 'MON',
      liquidity: monLiquidity,
      decimals: 18,
      feeRate: borrowFeeRate,
      icon: '🟡'
    },
    {
      name: 'Wrapped Bitcoin',
      symbol: 'WBTC',
      liquidity: wbtcLiquidity,
      decimals: 8,
      feeRate: borrowFeeRate,
      icon: '🟠'
    },
    {
      name: 'USD Coin',
      symbol: 'USDC',
      liquidity: usdcLiquidity,
      decimals: 6,
      feeRate: borrowFeeRate,
      icon: '🔵'
    }
  ];

  return (
    <div className="pt-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Borrow Assets</h1>
          <p className="text-gray-400">Borrow against your collateral with competitive rates</p>
        </div>

        {/* Assets Table */}
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800/50 border-b border-gray-800">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Asset</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Market Size</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Liquidity</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Fee Rate</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {assets.map((asset) => (
                  <tr key={asset.symbol} className="hover:bg-gray-800/50 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">{asset.icon}</div>
                        <div>
                          <div className="text-lg font-semibold text-white">{asset.symbol}</div>
                          <div className="text-sm text-gray-400">{asset.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-white font-medium">${formatAssetAmount(asset.liquidity, asset.decimals)}M</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-white font-medium">{formatAssetAmount(asset.liquidity, asset.decimals)} {asset.symbol}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-600/20 text-orange-400 border border-orange-600/30">
                        {asset.feeRate ? Number(asset.feeRate) / 100 : 0}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        href={`/borrow/${asset.symbol.toLowerCase()}`}
                        className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium rounded-lg shadow-lg hover:shadow-orange-500/25 transition-all duration-200"
                      >
                        Borrow {asset.symbol}
                        <span className="ml-2">→</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Guidelines */}
        <div className="mt-8 bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">How Borrowing Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-400">
            <div>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-orange-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>Choose any asset as collateral</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-orange-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>Up to 83% LTV (120% collateralization)</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-orange-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>Pay competitive borrowing fees</span>
                </li>
              </ul>
            </div>
            <div>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-orange-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>No minimum borrow amount</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-orange-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>Flexible repayment terms</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-orange-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>Instant collateral release on repayment</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Risk Warning */}
        <div className="mt-6 bg-orange-900/20 border border-orange-600/30 rounded-2xl p-6">
          <div className="flex items-start space-x-3">
            <div className="text-orange-400 text-lg">⚠️</div>
            <div>
              <h4 className="text-orange-400 font-semibold mb-2">Risk Warning</h4>
              <p className="text-sm text-gray-300">
                Borrowing involves risks. If cryptocurrency prices fall, you may be required to supplement your collateral. 
                Failure to do so could result in liquidation of your collateral.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Borrow;
