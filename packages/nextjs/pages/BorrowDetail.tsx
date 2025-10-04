import React, { useState } from "react";
import Link from "next/link";
import { formatUnits, parseUnits } from "viem";
import { useAccount } from "wagmi";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

interface Props {
  asset: string;
}

const BorrowDetail: React.FC<Props> = ({ asset }) => {
  const { address: connectedAddress } = useAccount();
  const [borrowAmount, setBorrowAmount] = useState("");
  const [selectedCollateralAsset, setSelectedCollateralAsset] = useState<number>(0);

  const assetSymbol = asset?.toUpperCase() || "";

  const assetData = {
    MON: { decimals: 18, icon: "🟣", name: "MON", enum: 0 },
    WBTC: { decimals: 8, icon: "🟠", name: "Wrapped Bitcoin", enum: 1 },
    USDC: { decimals: 6, icon: "🔵", name: "USD Coin", enum: 2 },
  };

  const currentAsset = assetData[assetSymbol as keyof typeof assetData];

  // Read contract data
  const { data: liquidity } = useScaffoldReadContract({
    contractName: "IplikciFinance",
    functionName: "getAvailableLiquidity",
    args: [currentAsset?.enum],
  });

  const { data: borrowFeeRate } = useScaffoldReadContract({
    contractName: "IplikciFinance",
    functionName: "borrowFeeBps",
  });

  const { data: collateralRate } = useScaffoldReadContract({
    contractName: "IplikciFinance",
    functionName: "borrowCollateralBps",
  });

  const { data: borrowPosition } = useScaffoldReadContract({
    contractName: "IplikciFinance",
    functionName: "getBorrowPosition",
    args: [connectedAddress],
  });

  // Calculate required collateral
  const { data: requiredCollateral } = useScaffoldReadContract({
    contractName: "IplikciFinance",
    functionName: "convertAssetValue",
    args: [
      borrowAmount && parseFloat(borrowAmount) > 0 ? parseUnits(borrowAmount, currentAsset?.decimals || 18) : 0n,
      currentAsset?.enum || 0,
      selectedCollateralAsset,
    ],
  });

  const finalRequiredCollateral =
    requiredCollateral && collateralRate ? (requiredCollateral * collateralRate) / 10000n : 0n;

  const parseAssetAmount = (amount: string, decimals: number) => {
    return parseUnits(amount, decimals);
  };

  const formatAssetAmount = (amount: bigint | undefined, decimals: number) => {
    if (!amount) return "0";
    return parseFloat(formatUnits(amount, decimals)).toFixed(2);
  };

  const getCollateralOptions = () => {
    return Object.values(assetData).filter(assetData => assetData.enum !== currentAsset?.enum);
  };

  const getAssetInfoByEnum = (enumValue: number) => {
    return Object.values(assetData).find(asset => asset.enum === enumValue);
  };

  const handleBorrow = async () => {
    if (!borrowAmount || parseFloat(borrowAmount) <= 0) return;
    if (!finalRequiredCollateral || finalRequiredCollateral === 0n) return;
    if (!currentAsset) return;

    try {
      const borrowAmt = parseAssetAmount(borrowAmount, currentAsset.decimals);
      const collateralInfo = getAssetInfoByEnum(selectedCollateralAsset);

      if (!collateralInfo) return;

      // Write transaction here
      console.log("Borrowing:", {
        asset: currentAsset.enum,
        amount: borrowAmt,
        collateralAsset: selectedCollateralAsset,
        collateralAmount: finalRequiredCollateral,
      });

      setBorrowAmount("");
    } catch (e) {
      console.error("Error borrowing:", e);
    }
  };

  const borrowedAmount = borrowPosition ? borrowPosition[3] : 0n;
  const hasExistingBorrow = borrowedAmount > 0n;

  return (
    <div className="pt-20 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Back button */}
        <Link
          href="/borrow"
          className="inline-flex items-center text-lime-400 hover:text-lime-300 mb-6 transition-colors duration-200"
        >
          ← Back to Borrow
        </Link>

        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <span className="text-3xl">{currentAsset?.icon}</span>
            <h1 className="text-4xl font-bold text-white">Borrow {assetSymbol}</h1>
          </div>
          <p className="text-gray-400">Borrow {currentAsset?.name} by providing collateral</p>
        </div>

        {!hasExistingBorrow ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Side - Asset Info */}
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-white mb-6">Asset Information</h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 px-4 bg-gray-800/50 rounded-lg border border-gray-700">
                  <span className="text-gray-400">Asset</span>
                  <span className="text-white font-medium flex items-center">
                    <span className="text-lg mr-2">{currentAsset?.icon}</span>
                    {assetSymbol} - {currentAsset?.name}
                  </span>
                </div>

                <div className="flex items-center justify-between py-3 px-4 bg-gray-800/50 rounded-lg border border-gray-700">
                  <span className="text-gray-400">Borrow Fee</span>
                  <span className="text-orange-400 font-medium text-lg">
                    {borrowFeeRate ? Number(borrowFeeRate) / 100 : 0}%
                  </span>
                </div>

                <div className="flex items-center justify-between py-3 px-4 bg-gray-800/50 rounded-lg border border-gray-700">
                  <span className="text-gray-400">Available Liquidity</span>
                  <span className="text-white font-medium">
                    {formatAssetAmount(liquidity, currentAsset?.decimals || 18)} {assetSymbol}
                  </span>
                </div>

                <div className="flex items-center justify-between py-3 px-4 bg-gray-800/50 rounded-lg border border-gray-700">
                  <span className="text-gray-400">Collateralization Required</span>
                  <span className="text-orange-400 font-medium">120%</span>
                </div>
              </div>

              {/* Current Borrowed Visualization */}
              <div className="mt-6 pt-6 border-t border-gray-800">
                <h4 className="text-sm font-medium text-gray-400 mb-3">Current Borrowing</h4>
                <div className="text-center py-4 text-gray-500">
                  <div className="text-2xl mb-2">💳</div>
                  <div>No active borrows</div>
                  <div className="text-sm">You can borrow up to available liquidity</div>
                </div>
              </div>
            </div>

            {/* Right Side - Borrow Form */}
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-white mb-6">Borrow {assetSymbol}</h3>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Amount to Borrow</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="0.0"
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none transition-all duration-200"
                      value={borrowAmount}
                      onChange={e => setBorrowAmount(e.target.value)}
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                      {assetSymbol}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Collateral Asset</label>
                  <select
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none transition-all duration-200"
                    value={selectedCollateralAsset}
                    onChange={e => setSelectedCollateralAsset(Number(e.target.value))}
                  >
                    {getCollateralOptions().map(asset => (
                      <option key={asset.enum} value={asset.enum}>
                        {asset.icon} {asset.name} ({Object.keys(assetData)[asset.enum]})
                      </option>
                    ))}
                  </select>
                </div>

                {borrowAmount && parseFloat(borrowAmount) > 0 && finalRequiredCollateral > 0n && (
                  <div className="bg-orange-600/10 border border-orange-600/30 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-orange-400">Required Collateral (120%)</span>
                      <span className="text-sm text-gray-400">Amount Locked</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-orange-400">
                        {formatAssetAmount(
                          finalRequiredCollateral,
                          getAssetInfoByEnum(selectedCollateralAsset)?.decimals || 18,
                        )}
                      </span>
                      <span className="text-lg font-bold text-white">
                        {Object.keys(assetData)[selectedCollateralAsset]}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400 mt-2">Your collateral will be locked until repayment</div>
                  </div>
                )}

                <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">Borrow Fee</span>
                    <span className="text-sm text-orange-400">
                      {borrowAmount && parseFloat(borrowAmount) > 0
                        ? ((parseFloat(borrowAmount) * Number(borrowFeeRate || 0)) / 10000).toFixed(6)
                        : "0.00"}{" "}
                      {assetSymbol}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">Fee is paid upfront and deducted from borrow amount</div>
                </div>

                <button
                  className="w-full py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold rounded-lg shadow-lg hover:shadow-orange-500/25 transition-all duration-200 transform hover:scale-105"
                  onClick={handleBorrow}
                  disabled={!borrowAmount || parseFloat(borrowAmount) <= 0 || !finalRequiredCollateral}
                >
                  Borrow {borrowAmount || "0"} {assetSymbol}
                </button>

                <div className="text-sm text-gray-400 text-center">
                  <p className="mb-2">By borrowing, you agree to the protocol terms</p>
                  <p className="text-xs">
                    • 120% collateralization required
                    <br />• Collateral locked until repayment
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Existing Borrow Position */
          <div className="max-w-2xl mx-auto">
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-white mb-6">Active Borrow Position</h3>

              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between py-3 px-4 bg-gray-800/50 rounded-lg border border-gray-700">
                  <span className="text-gray-400">Borrowed Amount</span>
                  <span className="text-white font-medium text-lg">
                    {formatAssetAmount(
                      borrowedAmount,
                      Number(borrowPosition?.[0]) === 0 ? 18 : Number(borrowPosition?.[0]) === 1 ? 8 : 6,
                    )}{" "}
                    {Object.keys(assetData)[Number(borrowPosition?.[0])]}
                  </span>
                </div>

                <div className="flex items-center justify-between py-3 px-4 bg-gray-800/50 rounded-lg border border-gray-700">
                  <span className="text-gray-400">Collateral Locked</span>
                  <span className="text-orange-400 font-medium">
                    {formatAssetAmount(
                      borrowPosition?.[2],
                      Number(borrowPosition?.[1]) === 0 ? 18 : Number(borrowPosition?.[1]) === 1 ? 8 : 6,
                    )}{" "}
                    {Object.keys(assetData)[Number(borrowPosition?.[1])]}
                  </span>
                </div>
              </div>

              <button className="w-full py-4 bg-gradient-to-r from-lime-500 to-lime-600 hover:from-lime-600 hover:to-lime-700 text-white font-bold rounded-lg shadow-lg hover:shadow-lime-500/25 transition-all duration-200">
                💰 Repay Full Loan
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BorrowDetail;
