"use client";

import { useState } from "react";
import type { NextPage } from "next";
import { formatEther, parseEther } from "viem";
import { useAccount } from "wagmi";
import { EtherInput } from "~~/components/scaffold-eth";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

const IplikciFinance: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const [supplyAmount, setSupplyAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [borrowAmount, setBorrowAmount] = useState("");

  // Read contract data
  const { data: supplyPosition } = useScaffoldReadContract({
    contractName: "IplikciFinance",
    functionName: "getSupplyPosition",
    args: [connectedAddress],
  });

  const { data: borrowPosition } = useScaffoldReadContract({
    contractName: "IplikciFinance",
    functionName: "getBorrowPosition",
    args: [connectedAddress],
  });

  const { data: creditScore } = useScaffoldReadContract({
    contractName: "IplikciFinance",
    functionName: "creditScores",
    args: [connectedAddress],
  });

  const { data: supplyApy } = useScaffoldReadContract({
    contractName: "IplikciFinance",
    functionName: "supplyMonEarnBps",
  });

  const { data: borrowFeeRate } = useScaffoldReadContract({
    contractName: "IplikciFinance",
    functionName: "borrowMonFeeBps",
  });

  const { data: collateralRate } = useScaffoldReadContract({
    contractName: "IplikciFinance",
    functionName: "borrowMonCollateralBps",
  });

  // Write functions
  const { writeContractAsync: writeIplikciFinance } = useScaffoldWriteContract({
    contractName: "IplikciFinance",
  });

  const handleSupply = async () => {
    if (!supplyAmount || parseFloat(supplyAmount) <= 0) return;
    try {
      await writeIplikciFinance({
        functionName: "supplyMon",
        value: parseEther(supplyAmount),
      });
      setSupplyAmount("");
    } catch (e) {
      console.error("Error supplying MON:", e);
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) return;
    try {
      await writeIplikciFinance({
        functionName: "withdrawMon",
        args: [parseEther(withdrawAmount)],
      });
      setWithdrawAmount("");
    } catch (e) {
      console.error("Error withdrawing MON:", e);
    }
  };

  const handleBorrow = async () => {
    if (!borrowAmount || parseFloat(borrowAmount) <= 0) return;
    if (!requiredCollateral || requiredCollateral === 0n) return;
    try {
      await writeIplikciFinance({
        functionName: "borrowMon",
        args: [parseEther(borrowAmount)],
        value: requiredCollateral,
      });
      setBorrowAmount("");
    } catch (e) {
      console.error("Error borrowing MON:", e);
    }
  };

  const handleRepay = async () => {
    if (!borrowPosition || borrowPosition[1] === 0n) return;
    try {
      await writeIplikciFinance({
        functionName: "repayMon",
        value: borrowPosition[1], // borrowed amount
      });
    } catch (e) {
      console.error("Error repaying MON:", e);
    }
  };

  const suppliedAmount = supplyPosition ? supplyPosition[0] : 0n;
  const earnedAmount = supplyPosition ? supplyPosition[1] : 0n;
  const borrowedCollateral = borrowPosition ? borrowPosition[0] : 0n;
  const borrowedAmount = borrowPosition ? borrowPosition[1] : 0n;

  const requiredCollateral =
    borrowAmount && parseFloat(borrowAmount) > 0 && collateralRate
      ? (parseEther(borrowAmount) * collateralRate) / 10000n
      : 0n;

  return (
    <div className="flex items-center flex-col flex-grow pt-10">
      {/* Header */}
      <div className="px-5 w-full max-w-6xl">
        <h1 className="text-center mb-4">
          <span className="block text-4xl font-bold">İplikçi Finance</span>
          <span className="block text-2xl mb-2">Simple Lending Protocol</span>
        </h1>

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
            <h2 className="text-2xl font-bold mb-4">💰 Supply MON</h2>

            {/* Supply Position */}
            <div className="bg-base-200 rounded-2xl p-4 mb-4">
              <div className="text-sm text-gray-500">Your Supply Position</div>
              <div className="text-xl font-bold">{formatEther(suppliedAmount)} MON</div>
              <div className="text-sm text-success">Earned: {formatEther(earnedAmount)} MON</div>
            </div>

            {/* Supply Form */}
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-500">Amount to Supply</label>
                <EtherInput value={supplyAmount} onChange={setSupplyAmount} placeholder="0.0" />
              </div>
              <button
                className="btn btn-primary w-full"
                onClick={handleSupply}
                disabled={!supplyAmount || parseFloat(supplyAmount) <= 0}
              >
                Supply MON
              </button>
            </div>

            {/* Withdraw Form */}
            <div className="divider">OR</div>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-500">Amount to Withdraw</label>
                <EtherInput value={withdrawAmount} onChange={setWithdrawAmount} placeholder="0.0" />
              </div>
              <button
                className="btn btn-secondary w-full"
                onClick={handleWithdraw}
                disabled={!withdrawAmount || parseFloat(withdrawAmount) <= 0 || suppliedAmount === 0n}
              >
                Withdraw MON
              </button>
            </div>
          </div>

          {/* Borrow Section */}
          <div className="bg-base-100 border-base-300 border shadow-md rounded-3xl p-6">
            <h2 className="text-2xl font-bold mb-4">💳 Borrow MON</h2>

            {/* Borrow Position */}
            <div className="bg-base-200 rounded-2xl p-4 mb-4">
              <div className="text-sm text-gray-500">Your Borrow Position</div>
              <div className="text-xl font-bold">{formatEther(borrowedAmount)} MON</div>
              <div className="text-sm">Collateral: {formatEther(borrowedCollateral)} MON</div>
            </div>

            {borrowedAmount === 0n ? (
              <>
                {/* Borrow Form */}
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-500">Amount to Borrow</label>
                    <EtherInput value={borrowAmount} onChange={setBorrowAmount} placeholder="0.0" />
                  </div>
                  {borrowAmount && parseFloat(borrowAmount) > 0 && (
                    <div className="bg-base-200 rounded-lg p-3">
                      <div className="text-sm text-gray-500">Required Collateral (120%)</div>
                      <div className="text-xl font-bold">{formatEther(requiredCollateral)} MON</div>
                    </div>
                  )}
                  <button
                    className="btn btn-primary w-full"
                    onClick={handleBorrow}
                    disabled={!borrowAmount || parseFloat(borrowAmount) <= 0}
                  >
                    Borrow MON
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
                      <div className="text-xl font-bold">{formatEther(borrowedAmount)} MON</div>
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
                <li>Supply MON to earn {supplyApy ? Number(supplyApy) / 100 : 0}% APY</li>
                <li>Interest is calculated continuously</li>
                <li>Withdraw anytime (principal + interest)</li>
                <li>Each supply increases your credit score</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Borrow</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                <li>Enter borrow amount, contract calculates required collateral (120%)</li>
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
