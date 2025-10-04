"use client";

import Link from "next/link";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { BugAntIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { Address } from "~~/components/scaffold-eth";

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();

  return (
    <>
      <div className="flex items-center flex-col grow pt-10">
        <div className="px-5">
          <h1 className="text-center">
            <span className="block text-4xl font-bold mb-2">İplikçi Finance</span>
            <span className="block text-2xl mb-2">Simple Lending Protocol on MON</span>
          </h1>
          <div className="flex justify-center items-center space-x-2 flex-col">
            <p className="my-2 font-medium">Connected Address:</p>
            <Address address={connectedAddress} />
          </div>

          <div className="text-center mt-8 mb-8">
            <Link href="/iplikci-finance" passHref>
              <button className="btn btn-primary btn-lg">Launch App →</button>
            </Link>
          </div>

          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-4">Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
              <div className="bg-base-200 p-4 rounded-xl">
                <div className="text-3xl mb-2">💰</div>
                <h3 className="font-bold">Supply & Earn</h3>
                <p className="text-sm">Supply MON and earn 8% APY</p>
              </div>
              <div className="bg-base-200 p-4 rounded-xl">
                <div className="text-3xl mb-2">💳</div>
                <h3 className="font-bold">Borrow MON</h3>
                <p className="text-sm">Borrow with 120% collateral</p>
              </div>
              <div className="bg-base-200 p-4 rounded-xl">
                <div className="text-3xl mb-2">📈</div>
                <h3 className="font-bold">Credit Score</h3>
                <p className="text-sm">Build credit by supplying & repaying</p>
              </div>
              <div className="bg-base-200 p-4 rounded-xl">
                <div className="text-3xl mb-2">⚡</div>
                <h3 className="font-bold">Simple & Fast</h3>
                <p className="text-sm">No liquidation, instant transactions</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grow bg-base-300 w-full mt-16 px-8 py-12">
          <div className="flex justify-center items-center gap-12 flex-col md:flex-row">
            <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl">
              <BugAntIcon className="h-8 w-8 fill-secondary" />
              <p>
                Tinker with your smart contract using the{" "}
                <Link href="/debug" passHref className="link">
                  Debug Contracts
                </Link>{" "}
                tab.
              </p>
            </div>
            <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl">
              <MagnifyingGlassIcon className="h-8 w-8 fill-secondary" />
              <p>
                Explore your local transactions with the{" "}
                <Link href="/blockexplorer" passHref className="link">
                  Block Explorer
                </Link>{" "}
                tab.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
