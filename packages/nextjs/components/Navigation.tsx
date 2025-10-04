import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { hardhat } from "viem/chains";
// import { useAccount, useConnect, useDisconnect } from "wagmi";
import { FaucetButton, RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";
import { useTargetNetwork } from "~~/hooks/scaffold-eth";

const Navigation: React.FC = () => {
  const pathname = usePathname();
  // const { address, isConnected } = useAccount();
  // const { connect, connectors } = useConnect();
  // const { disconnect } = useDisconnect();

  const { targetNetwork } = useTargetNetwork();
  const isLocalNetwork = targetNetwork.id === hardhat.id;

  const navItems = [
    { path: "/", label: "Dashboard", icon: "📊" },
    { path: "/supply", label: "Supply", icon: "💰" },
    { path: "/borrow", label: "Borrow", icon: "💳" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black border-b border-monad-dark-gray">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <img src="/iplikci-logo.png" alt="FIplikci" className="h-12" />
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map(item => {
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    isActive
                      ? "bg-monad-dark-green text-monad-green"
                      : "text-gray-400 hover:text-white hover:bg-monad-dark-gray"
                  }`}
                >
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Wallet Connection */}
          {/* <div className="flex items-center space-x-4">
            {isConnected ? (
              <div className="flex items-center space-x-3">
                <div className="hidden sm:block px-3 py-1 rounded-lg bg-monad-dark-gray text-white">
                  <span className="text-sm">
                    {address?.slice(0, 6)}...{address?.slice(-4)}
                  </span>
                </div>
                <button
                  onClick={() => disconnect()}
                  className="px-4 py-2 bg-monad-dark-gray text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  if (connectors[0]) {
                    connect({ connector: connectors[0] });
                  }
                }}
                className="px-6 py-2 bg-monad-green text-black font-medium rounded-lg hover:opacity-90 transition-opacity"
              >
                Connect Wallet
              </button>
            )}
          </div> */}

          <div className="flex">
            <RainbowKitCustomConnectButton />
            {isLocalNetwork && <FaucetButton />}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
