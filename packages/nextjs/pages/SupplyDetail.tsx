import React, { useState } from "react";
import Link from "next/link";
import { formatUnits, parseUnits } from "viem";
import { useAccount } from "wagmi";
import { useDeployedContractInfo, useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

interface Props {
  asset: string;
}

const SupplyDetail: React.FC<Props> = ({ asset }) => {
  const { address: connectedAddress } = useAccount();
  const [supplyAmount, setSupplyAmount] = useState("");

  const assetSymbol = asset?.toUpperCase() || "";

  // Get IplikciFinance contract address
  const { data: iplikciFinanceContract } = useDeployedContractInfo({ contractName: "IplikciFinance" });

  const assetData = {
    MON: { decimals: 18, icon: "🟣", name: "MON" },
    WBTC: { decimals: 8, icon: "🟠", name: "Wrapped Bitcoin" },
    USDC: { decimals: 6, icon: "🔵", name: "USD Coin" },
  };

  const currentAsset = assetData[assetSymbol as keyof typeof assetData];

  // Read contract data
  const { data: liquidity } = useScaffoldReadContract({
    contractName: "IplikciFinance",
    functionName: "getAvailableLiquidity",
    args: [asset === "mon" ? 0 : asset === "wbtc" ? 1 : 2],
  });

  const { data: supplyApy } = useScaffoldReadContract({
    contractName: "IplikciFinance",
    functionName: "supplyEarnBps",
  });

  const { data: userSupplyPosition } = useScaffoldReadContract({
    contractName: "IplikciFinance",
    functionName: "getSupplyPosition",
    args: [connectedAddress, asset === "mon" ? 0 : asset === "wbtc" ? 1 : 2],
  });

  // Write functions
  const { writeContractAsync: writeIplikciFinance } = useScaffoldWriteContract({
    contractName: "IplikciFinance",
  });

  const { writeContractAsync: writeWBTC } = useScaffoldWriteContract({
    contractName: "MockWBTC",
  });

  const { writeContractAsync: writeUSDC } = useScaffoldWriteContract({
    contractName: "MockUSDC",
  });

  const parseAssetAmount = (amount: string, decimals: number) => {
    return parseUnits(amount, decimals);
  };

  const formatAssetAmount = (amount: bigint | undefined, decimals: number) => {
    if (!amount) return "0";
    return parseFloat(formatUnits(amount, decimals)).toFixed(2);
  };

  const handleSupply = async () => {
    if (!supplyAmount || parseFloat(supplyAmount) <= 0) return;
    if (!currentAsset) return;
    if (!iplikciFinanceContract?.address) return;

    try {
      const amount = parseAssetAmount(supplyAmount, currentAsset.decimals);

      // If ERC20, approve first
      if (assetSymbol !== "MON") {
        const writeFunc = assetSymbol === "WBTC" ? writeWBTC : writeUSDC;
        await writeFunc({
          functionName: "approve",
          args: [iplikciFinanceContract.address, amount],
        });
      }

      await writeIplikciFinance({
        functionName: "supply",
        args: [asset === "mon" ? 0 : asset === "wbtc" ? 1 : 2, amount],
        value: assetSymbol === "MON" ? amount : 0n,
      });

      setSupplyAmount("");
    } catch (e) {
      console.error("Error supplying:", e);
    }
  };

  return (
    <div className="pt-20 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Back button */}
        <Link
          href="/supply"
          className="inline-flex items-center text-lime-400 hover:text-lime-300 mb-6 transition-colors duration-200"
        >
          ← Back to Supply
        </Link>

        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <span className="text-3xl">{currentAsset?.icon}</span>
            <h1 className="text-4xl font-bold text-white">Supply {assetSymbol}</h1>
          </div>
          <p className="text-gray-400">Supply {currentAsset?.name} to earn yield on the protocol</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Side - Asset Info */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6">
            <h3 className="text-xl font-semibold text-white mb-6">Asset Information</h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 px-4 bg-gray-800/50 rounded-lg border border-gray-700">
                <span className="text-gray-400">Asset</span>
                <span className="text-white font-medium flex items-center">
                  <span className="text-lg mr-2">{currentAsset?.icon}</span>
                  {assetSymbol}
                </span>
              </div>

              <div className="flex items-center justify-between py-3 px-4 bg-gray-800/50 rounded-lg border border-gray-700">
                <span className="text-gray-400">Current APY</span>
                <span className="text-lime-400 font-medium text-lg">{supplyApy ? Number(supplyApy) / 100 : 0}%</span>
              </div>

              <div className="flex items-center justify-between py-3 px-4 bg-gray-800/50 rounded-lg border border-gray-700">
                <span className="text-gray-400">Available Liquidity</span>
                <span className="text-white font-medium">
                  {formatAssetAmount(liquidity, currentAsset?.decimals || 18)} {assetSymbol}
                </span>
              </div>

              <div className="flex items-center justify-between py-3 px-4 bg-gray-800/50 rounded-lg border border-gray-700">
                <span className="text-gray-400">Your Supply</span>
                <span className="text-white font-medium">
                  {formatAssetAmount(userSupplyPosition?.[0], currentAsset?.decimals || 18)} {assetSymbol}
                </span>
              </div>

              <div className="flex items-center justify-between py-3 px-4 bg-gray-800/50 rounded-lg border border-gray-700">
                <span className="text-gray-400">Earned Interest</span>
                <span className="text-lime-400 font-medium">
                  +{formatAssetAmount(userSupplyPosition?.[1], currentAsset?.decimals || 18)} {assetSymbol}
                </span>
              </div>
            </div>

            {/* Market Size Visualization */}
            <div className="mt-6 pt-6 border-t border-gray-800">
              <h4 className="text-sm font-medium text-gray-400 mb-3">Market Total</h4>
              <div className="bg-gray-800 rounded-full h-4 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-lime-400 to-lime-600 h-4 rounded-full transition-all duration-300"
                  style={{ width: "68%" }}
                ></div>
              </div>
              <div className="text-xs text-gray-400 mt-1">
                $2.4M Total • $1.6M Supplied • {formatAssetAmount(liquidity, currentAsset?.decimals || 18)}{" "}
                {assetSymbol} Available
              </div>
            </div>
          </div>

          {/* Right Side - Supply Form */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6">
            <h3 className="text-xl font-semibold text-white mb-6">Supply {assetSymbol}</h3>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Amount to Supply</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="0.0"
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-lime-500 focus:ring-1 focus:ring-lime-500 focus:outline-none transition-all duration-200"
                    value={supplyAmount}
                    onChange={e => setSupplyAmount(e.target.value)}
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">{assetSymbol}</div>
                </div>
              </div>

              {supplyAmount && parseFloat(supplyAmount) > 0 && (
                <div className="bg-lime-600/10 border border-lime-600/30 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">Estimated Daily Yield</span>
                    <span className="text-sm text-lime-400 font-medium">
                      {((parseFloat(supplyAmount) * Number(supplyApy || 0)) / 100 / 365).toFixed(6)} {assetSymbol}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Estimated Monthly Yield</span>
                    <span className="text-sm text-lime-400 font-medium">
                      {((parseFloat(supplyAmount) * Number(supplyApy || 0)) / 100 / 12).toFixed(4)} {assetSymbol}
                    </span>
                  </div>
                </div>
              )}

              <button
                className="w-full py-4 bg-gradient-to-r from-lime-500 to-lime-600 hover:from-lime-600 hover:to-lime-700 text-white font-bold rounded-lg shadow-lg hover:shadow-lime-500/25 transition-all duration-200 transform hover:scale-105"
                onClick={handleSupply}
                disabled={!supplyAmount || parseFloat(supplyAmount) <= 0}
              >
                Supply {supplyAmount || "0"} {assetSymbol}
              </button>

              <div className="text-sm text-gray-400 text-center">
                <p className="mb-2">By supplying, you agree to the protocol terms</p>
                <p className="text-xs">
                  • APY is calculated continuously and paid instantly
                  <br />• You can withdraw your assets at any time
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupplyDetail;
