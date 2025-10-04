"use client";

import { useState } from "react";
import type { NextPage } from "next";
import { formatUnits, parseUnits } from "viem";
import { useAccount } from "wagmi";
import { AddressInput } from "~~/components/scaffold-eth";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";

const Faucet: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const [selectedToken, setSelectedToken] = useState<"WBTC" | "USDC">("USDC");
  const [recipientAddress, setRecipientAddress] = useState<string>("");
  const [mintAmount, setMintAmount] = useState<string>("");

  // Read token balances
  const { data: wbtcBalance } = useScaffoldReadContract({
    contractName: "MockWBTC",
    functionName: "balanceOf",
    args: [connectedAddress],
  });

  const { data: usdcBalance } = useScaffoldReadContract({
    contractName: "MockUSDC",
    functionName: "balanceOf",
    args: [connectedAddress],
  });

  // Write contracts
  const { writeContractAsync: writeWBTCAsync } = useScaffoldWriteContract({
    contractName: "MockWBTC",
  });

  const { writeContractAsync: writeUSDCAsync } = useScaffoldWriteContract({
    contractName: "MockUSDC",
  });

  const handleMint = async () => {
    if (!recipientAddress) {
      notification.error("Please enter a recipient address");
      return;
    }

    if (!mintAmount || parseFloat(mintAmount) <= 0) {
      notification.error("Please enter a valid amount");
      return;
    }

    try {
      const decimals = selectedToken === "WBTC" ? 8 : 6;
      const amountInSmallestUnit = parseUnits(mintAmount, decimals);

      const writeAsync = selectedToken === "WBTC" ? writeWBTCAsync : writeUSDCAsync;

      await writeAsync({
        functionName: "mint",
        args: [recipientAddress, amountInSmallestUnit],
      });

      notification.success(`Successfully minted ${mintAmount} ${selectedToken} to ${recipientAddress}`);
      setMintAmount("");
    } catch (error: any) {
      console.error("Error minting tokens:", error);
      notification.error(error?.message || "Failed to mint tokens");
    }
  };

  const formatBalance = (balance: bigint | undefined, decimals: number) => {
    if (!balance) return "0";
    return parseFloat(formatUnits(balance, decimals)).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: decimals,
    });
  };

  return (
    <div className="flex items-center flex-col flex-grow pt-10">
      <div className="px-5 w-full max-w-4xl">
        <h1 className="text-center mb-8">
          <span className="block text-4xl font-bold">Token Faucet</span>
          <span className="block text-2xl mt-2">Mint test WBTC and USDC tokens</span>
        </h1>

        {/* Current Balances */}
        <div className="bg-base-100 border-base-300 border shadow-md shadow-secondary rounded-3xl px-6 py-8 mb-8">
          <h2 className="text-2xl font-bold mb-4">Your Balances</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-base-200 rounded-lg p-4">
              <div className="text-sm text-gray-500">WBTC Balance</div>
              <div className="text-2xl font-bold">{formatBalance(wbtcBalance, 8)} WBTC</div>
            </div>
            <div className="bg-base-200 rounded-lg p-4">
              <div className="text-sm text-gray-500">USDC Balance</div>
              <div className="text-2xl font-bold">{formatBalance(usdcBalance, 6)} USDC</div>
            </div>
          </div>
        </div>

        {/* Mint Form */}
        <div className="bg-base-100 border-base-300 border shadow-md shadow-secondary rounded-3xl px-6 py-8">
          <h2 className="text-2xl font-bold mb-6">Mint Tokens</h2>

          {/* Token Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Select Token</label>
            <div className="flex gap-4">
              <button
                className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${
                  selectedToken === "WBTC" ? "bg-primary text-primary-content" : "bg-base-200 hover:bg-base-300"
                }`}
                onClick={() => setSelectedToken("WBTC")}
              >
                WBTC (8 decimals)
              </button>
              <button
                className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${
                  selectedToken === "USDC" ? "bg-primary text-primary-content" : "bg-base-200 hover:bg-base-300"
                }`}
                onClick={() => setSelectedToken("USDC")}
              >
                USDC (6 decimals)
              </button>
            </div>
          </div>

          {/* Recipient Address */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Recipient Address</label>
            <AddressInput
              value={recipientAddress}
              onChange={setRecipientAddress}
              placeholder="Enter recipient address"
            />
            {connectedAddress && (
              <button
                className="mt-2 text-sm text-primary hover:underline"
                onClick={() => setRecipientAddress(connectedAddress)}
              >
                Use my address
              </button>
            )}
          </div>

          {/* Amount Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Amount</label>
            <input
              type="number"
              className="input input-bordered w-full"
              placeholder={`Enter amount in ${selectedToken}`}
              value={mintAmount}
              onChange={e => setMintAmount(e.target.value)}
              step="0.01"
              min="0"
            />
            <div className="mt-2 flex gap-2">
              <button className="btn btn-sm btn-outline" onClick={() => setMintAmount("1")}>
                1
              </button>
              <button className="btn btn-sm btn-outline" onClick={() => setMintAmount("10")}>
                10
              </button>
              <button className="btn btn-sm btn-outline" onClick={() => setMintAmount("100")}>
                100
              </button>
              <button className="btn btn-sm btn-outline" onClick={() => setMintAmount("1000")}>
                1000
              </button>
            </div>
          </div>

          {/* Mint Button */}
          <button
            className="btn btn-primary w-full btn-lg"
            onClick={handleMint}
            disabled={!recipientAddress || !mintAmount || parseFloat(mintAmount) <= 0}
          >
            Mint {selectedToken}
          </button>

          {/* Info Box */}
          <div className="mt-6 p-4 bg-info/10 rounded-lg">
            <p className="text-sm">
              <strong>ℹ️ Note:</strong> These are test tokens for development purposes only.
              {selectedToken === "WBTC"
                ? " WBTC has 8 decimals like real Bitcoin."
                : " USDC has 6 decimals like the real USD Coin."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Faucet;
