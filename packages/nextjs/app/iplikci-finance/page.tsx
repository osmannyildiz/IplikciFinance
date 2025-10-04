"use client";

import { useState } from "react";
import type { NextPage } from "next";
import { formatUnits, parseUnits } from "viem";
import { useAccount } from "wagmi";
import { useDeployedContractInfo, useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

// Asset enum matches contract
enum Asset {
  MON = 0,
  WBTC = 1,
  USDC = 2,
}

const ASSET_NAMES = ["MON", "WBTC", "USDC"];
const ASSET_DECIMALS = [18, 8, 6];

const IplikciFinance: NextPage = () => {
  const { address: connectedAddress } = useAccount();

  // Supply state
  const [selectedSupplyAsset, setSelectedSupplyAsset] = useState<Asset>(Asset.MON);
  const [supplyAmount, setSupplyAmount] = useState("");
  const [selectedWithdrawAsset, setSelectedWithdrawAsset] = useState<Asset>(Asset.MON);
  const [withdrawAmount, setWithdrawAmount] = useState("");

  // Borrow state
  const [selectedBorrowAsset, setSelectedBorrowAsset] = useState<Asset>(Asset.MON);
  const [selectedCollateralAsset, setSelectedCollateralAsset] = useState<Asset>(Asset.WBTC);
  const [borrowAmount, setBorrowAmount] = useState("");

  // Read contract data
  const { data: creditScore } = useScaffoldReadContract({
    contractName: "IplikciFinance",
    functionName: "creditScores",
    args: [connectedAddress],
  });

  const { data: supplyApy } = useScaffoldReadContract({
    contractName: "IplikciFinance",
    functionName: "supplyEarnBps",
  });

  const { data: borrowFeeRate } = useScaffoldReadContract({
    contractName: "IplikciFinance",
    functionName: "borrowFeeBps",
  });

  const { data: collateralRate } = useScaffoldReadContract({
    contractName: "IplikciFinance",
    functionName: "borrowCollateralBps",
  });

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

  // Get supply positions for all assets
  const { data: monSupplyPosition } = useScaffoldReadContract({
    contractName: "IplikciFinance",
    functionName: "getSupplyPosition",
    args: [connectedAddress, 0],
  });

  const { data: wbtcSupplyPosition } = useScaffoldReadContract({
    contractName: "IplikciFinance",
    functionName: "getSupplyPosition",
    args: [connectedAddress, 1],
  });

  const { data: usdcSupplyPosition } = useScaffoldReadContract({
    contractName: "IplikciFinance",
    functionName: "getSupplyPosition",
    args: [connectedAddress, 2],
  });

  // Get borrow position
  const { data: borrowPosition } = useScaffoldReadContract({
    contractName: "IplikciFinance",
    functionName: "getBorrowPosition",
    args: [connectedAddress],
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

  // Get contract info
  const { data: iplikciFinanceContract } = useDeployedContractInfo("IplikciFinance");

  // Helper functions
  const formatAssetAmount = (amount: bigint | undefined, asset: Asset) => {
    if (!amount) return "0";
    const decimals = ASSET_DECIMALS[asset];
    return formatUnits(amount, decimals);
  };

  const parseAssetAmount = (amount: string, asset: Asset) => {
    const decimals = ASSET_DECIMALS[asset];
    return parseUnits(amount, decimals);
  };

  const getSupplyPosition = (asset: Asset) => {
    if (asset === Asset.MON) return monSupplyPosition;
    if (asset === Asset.WBTC) return wbtcSupplyPosition;
    return usdcSupplyPosition;
  };

  // Calculate required collateral
  const { data: requiredCollateral } = useScaffoldReadContract({
    contractName: "IplikciFinance",
    functionName: "convertAssetValue",
    args: [
      borrowAmount && parseFloat(borrowAmount) > 0 ? parseAssetAmount(borrowAmount, selectedBorrowAsset) : 0n,
      selectedBorrowAsset,
      selectedCollateralAsset,
    ],
  });

  const finalRequiredCollateral =
    requiredCollateral && collateralRate ? (requiredCollateral * collateralRate) / 10000n : 0n;

  // Handle functions
  const handleSupply = async () => {
    if (!supplyAmount || parseFloat(supplyAmount) <= 0) return;
    if (!iplikciFinanceContract) return;

    try {
      const amount = parseAssetAmount(supplyAmount, selectedSupplyAsset);

      // If ERC20, approve first
      if (selectedSupplyAsset !== Asset.MON) {
        const writeFunc = selectedSupplyAsset === Asset.WBTC ? writeWBTC : writeUSDC;

        await writeFunc({
          functionName: "approve",
          args: [iplikciFinanceContract.address, amount],
        });
      }

      await writeIplikciFinance({
        functionName: "supply",
        args: [selectedSupplyAsset, amount],
        value: selectedSupplyAsset === Asset.MON ? amount : 0n,
      });

      setSupplyAmount("");
    } catch (e) {
      console.error("Error supplying:", e);
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) return;

    try {
      const amount = parseAssetAmount(withdrawAmount, selectedWithdrawAsset);

      await writeIplikciFinance({
        functionName: "withdraw",
        args: [selectedWithdrawAsset, amount],
      });

      setWithdrawAmount("");
    } catch (e) {
      console.error("Error withdrawing:", e);
    }
  };

  const handleBorrow = async () => {
    if (!borrowAmount || parseFloat(borrowAmount) <= 0) return;
    if (!finalRequiredCollateral || finalRequiredCollateral === 0n) return;
    if (!iplikciFinanceContract) return;

    try {
      const borrowAmt = parseAssetAmount(borrowAmount, selectedBorrowAsset);

      // If ERC20 collateral, approve first
      if (selectedCollateralAsset !== Asset.MON) {
        const writeFunc = selectedCollateralAsset === Asset.WBTC ? writeWBTC : writeUSDC;

        await writeFunc({
          functionName: "approve",
          args: [iplikciFinanceContract.address, finalRequiredCollateral],
        });
      }

      await writeIplikciFinance({
        functionName: "borrow",
        args: [selectedBorrowAsset, borrowAmt, selectedCollateralAsset, finalRequiredCollateral],
        value: selectedCollateralAsset === Asset.MON ? finalRequiredCollateral : 0n,
      });

      setBorrowAmount("");
    } catch (e) {
      console.error("Error borrowing:", e);
    }
  };

  const handleRepay = async () => {
    if (!borrowPosition || borrowPosition[3] === 0n) return;
    if (!iplikciFinanceContract) return;

    try {
      const borrowAsset = Number(borrowPosition[0]);
      const repayAmount = borrowPosition[3];

      // If ERC20, approve first
      if (borrowAsset !== Asset.MON) {
        const writeFunc = borrowAsset === Asset.WBTC ? writeWBTC : writeUSDC;

        await writeFunc({
          functionName: "approve",
          args: [iplikciFinanceContract.address, repayAmount],
        });
      }

      await writeIplikciFinance({
        functionName: "repay",
        value: borrowAsset === Asset.MON ? repayAmount : 0n,
      });
    } catch (e) {
      console.error("Error repaying:", e);
    }
  };

  const borrowedAmount = borrowPosition ? borrowPosition[3] : 0n;
  const borrowedCollateral = borrowPosition ? borrowPosition[2] : 0n;
  const borrowAssetType = borrowPosition ? Number(borrowPosition[0]) : 0;
  const collateralAssetType = borrowPosition ? Number(borrowPosition[1]) : 0;

  // Get available collateral options (excluding selected borrow asset)
  const getCollateralOptions = () => {
    return [Asset.MON, Asset.WBTC, Asset.USDC].filter(asset => asset !== selectedBorrowAsset);
  };

  // Update collateral asset if it matches borrow asset
  const handleBorrowAssetChange = (asset: Asset) => {
    setSelectedBorrowAsset(asset);
    if (asset === selectedCollateralAsset) {
      // Pick the first available collateral option
      const options = [Asset.MON, Asset.WBTC, Asset.USDC].filter(a => a !== asset);
      setSelectedCollateralAsset(options[0]);
    }
  };

  return (
    <div className="flex items-center flex-col flex-grow pt-10">
      <div className="px-5 w-full max-w-7xl">
        <h1 className="text-center mb-4">
          <span className="block text-4xl font-bold">İplikçi Finance</span>
          <span className="block text-2xl mb-2">Multi-Asset Lending Protocol</span>
        </h1>

        {/* Liquidity Stats */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-3 text-center">Available Liquidity</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-base-100 border-base-300 border shadow-md rounded-3xl px-6 py-4">
              <div className="text-sm text-gray-500">MON</div>
              <div className="text-2xl font-bold">{formatAssetAmount(monLiquidity, Asset.MON)}</div>
            </div>
            <div className="bg-base-100 border-base-300 border shadow-md rounded-3xl px-6 py-4">
              <div className="text-sm text-gray-500">WBTC</div>
              <div className="text-2xl font-bold">{formatAssetAmount(wbtcLiquidity, Asset.WBTC)}</div>
            </div>
            <div className="bg-base-100 border-base-300 border shadow-md rounded-3xl px-6 py-4">
              <div className="text-sm text-gray-500">USDC</div>
              <div className="text-2xl font-bold">{formatAssetAmount(usdcLiquidity, Asset.USDC)}</div>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-base-100 border-base-300 border shadow-md rounded-3xl px-6 py-4">
            <div className="text-sm text-gray-500">Supply APY</div>
            <div className="text-2xl font-bold">{supplyApy ? Number(supplyApy) / 100 : 0}%</div>
          </div>
          <div className="bg-base-100 border-base-300 border shadow-md rounded-3xl px-6 py-4">
            <div className="text-sm text-gray-500">Borrow Fee</div>
            <div className="text-2xl font-bold">{borrowFeeRate ? Number(borrowFeeRate) / 100 : 0}%</div>
          </div>
          <div className="bg-base-100 border-base-300 border shadow-md rounded-3xl px-6 py-4">
            <div className="text-sm text-gray-500">Your Credit Score</div>
            <div className="text-2xl font-bold">{creditScore?.toString() || "0"}</div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Supply Section */}
          <div className="bg-base-100 border-base-300 border shadow-md rounded-3xl p-6">
            <h2 className="text-2xl font-bold mb-4">💰 Supply Assets</h2>

            {/* All Supply Positions */}
            <div className="space-y-2 mb-4">
              {[Asset.MON, Asset.WBTC, Asset.USDC].map(asset => {
                const position = getSupplyPosition(asset);
                const amount = position ? position[0] : 0n;
                const earned = position ? position[1] : 0n;

                return (
                  <div key={asset} className="bg-base-200 rounded-lg p-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-xs text-gray-500">{ASSET_NAMES[asset]}</div>
                        <div className="font-bold">{formatAssetAmount(amount, asset)}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-500">Earned</div>
                        <div className="text-sm text-success">{formatAssetAmount(earned, asset)}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Supply Form */}
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-500">Asset to Supply</label>
                <select
                  className="select select-bordered w-full"
                  value={selectedSupplyAsset}
                  onChange={e => setSelectedSupplyAsset(Number(e.target.value) as Asset)}
                >
                  <option value={Asset.MON}>MON</option>
                  <option value={Asset.WBTC}>WBTC</option>
                  <option value={Asset.USDC}>USDC</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-500">Amount</label>
                <input
                  type="text"
                  placeholder="0.0"
                  className="input input-bordered w-full"
                  value={supplyAmount}
                  onChange={e => setSupplyAmount(e.target.value)}
                />
              </div>
              <button
                className="btn btn-primary w-full"
                onClick={handleSupply}
                disabled={!supplyAmount || parseFloat(supplyAmount) <= 0}
              >
                Supply {ASSET_NAMES[selectedSupplyAsset]}
              </button>
            </div>

            {/* Withdraw Form */}
            <div className="divider">OR</div>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-500">Asset to Withdraw</label>
                <select
                  className="select select-bordered w-full"
                  value={selectedWithdrawAsset}
                  onChange={e => setSelectedWithdrawAsset(Number(e.target.value) as Asset)}
                >
                  <option value={Asset.MON}>MON</option>
                  <option value={Asset.WBTC}>WBTC</option>
                  <option value={Asset.USDC}>USDC</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-500">Amount</label>
                <input
                  type="text"
                  placeholder="0.0"
                  className="input input-bordered w-full"
                  value={withdrawAmount}
                  onChange={e => setWithdrawAmount(e.target.value)}
                />
              </div>
              <button
                className="btn btn-secondary w-full"
                onClick={handleWithdraw}
                disabled={!withdrawAmount || parseFloat(withdrawAmount) <= 0}
              >
                Withdraw {ASSET_NAMES[selectedWithdrawAsset]}
              </button>
            </div>
          </div>

          {/* Borrow Section */}
          <div className="bg-base-100 border-base-300 border shadow-md rounded-3xl p-6">
            <h2 className="text-2xl font-bold mb-4">💳 Borrow Assets</h2>

            {/* Borrow Position */}
            <div className="bg-base-200 rounded-2xl p-4 mb-4">
              <div className="text-sm text-gray-500">Your Borrow Position</div>
              <div className="text-xl font-bold">
                {formatAssetAmount(borrowedAmount, borrowAssetType)} {ASSET_NAMES[borrowAssetType]}
              </div>
              <div className="text-sm">
                Collateral: {formatAssetAmount(borrowedCollateral, collateralAssetType)}{" "}
                {ASSET_NAMES[collateralAssetType]}
              </div>
            </div>

            {borrowedAmount === 0n ? (
              <>
                {/* Borrow Form */}
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-500">Asset to Borrow</label>
                    <select
                      className="select select-bordered w-full"
                      value={selectedBorrowAsset}
                      onChange={e => handleBorrowAssetChange(Number(e.target.value) as Asset)}
                    >
                      <option value={Asset.MON}>MON</option>
                      <option value={Asset.WBTC}>WBTC</option>
                      <option value={Asset.USDC}>USDC</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Borrow Amount</label>
                    <input
                      type="text"
                      placeholder="0.0"
                      className="input input-bordered w-full"
                      value={borrowAmount}
                      onChange={e => setBorrowAmount(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Collateral Asset</label>
                    <select
                      className="select select-bordered w-full"
                      value={selectedCollateralAsset}
                      onChange={e => setSelectedCollateralAsset(Number(e.target.value) as Asset)}
                    >
                      {getCollateralOptions().map(asset => (
                        <option key={asset} value={asset}>
                          {ASSET_NAMES[asset]}
                        </option>
                      ))}
                    </select>
                  </div>
                  {borrowAmount && parseFloat(borrowAmount) > 0 && (
                    <div className="bg-base-200 rounded-lg p-3">
                      <div className="text-sm text-gray-500">Required Collateral (120%)</div>
                      <div className="text-xl font-bold">
                        {formatAssetAmount(finalRequiredCollateral, selectedCollateralAsset)}{" "}
                        {ASSET_NAMES[selectedCollateralAsset]}
                      </div>
                    </div>
                  )}
                  <button
                    className="btn btn-primary w-full"
                    onClick={handleBorrow}
                    disabled={!borrowAmount || parseFloat(borrowAmount) <= 0}
                  >
                    Borrow {ASSET_NAMES[selectedBorrowAsset]}
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Repay Form */}
                <div className="space-y-4">
                  <div className="alert alert-info">
                    <div>
                      <div className="text-sm">Amount to Repay</div>
                      <div className="text-xl font-bold">
                        {formatAssetAmount(borrowedAmount, borrowAssetType)} {ASSET_NAMES[borrowAssetType]}
                      </div>
                    </div>
                  </div>
                  <button className="btn btn-success w-full" onClick={handleRepay}>
                    Repay Full Loan
                  </button>
                  <div className="text-xs text-gray-500 text-center">
                    Your collateral will be returned after repayment
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-8 bg-base-100 border-base-300 border shadow-md rounded-3xl p-6">
          <h3 className="text-xl font-bold mb-3">ℹ️ How it works</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2">Supply</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                <li>Supply MON, WBTC, or USDC to earn {supplyApy ? Number(supplyApy) / 100 : 0}% APY</li>
                <li>Interest calculated continuously for each asset</li>
                <li>Withdraw anytime (principal + interest)</li>
                <li>Each supply increases your credit score</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Borrow</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                <li>Choose which asset to borrow and which to use as collateral</li>
                <li>Contract calculates required collateral (120%) based on prices</li>
                <li>Pay {borrowFeeRate ? Number(borrowFeeRate) / 100 : 10}% upfront fee</li>
                <li>Repay full amount to get collateral back</li>
                <li>Repaying increases your credit score by 2x</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IplikciFinance;
