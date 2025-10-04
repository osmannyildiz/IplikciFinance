import React from "react";
import { useAccount } from "wagmi";
import { RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";

const HeroSection: React.FC = () => {
  // const { connect } = useConnect();
  const { isConnected } = useAccount();

  if (isConnected) return null;

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 py-24">
        {/* <div className="text-center mb-8">
          <div className="inline-block mb-4">
            <img src="/logo.svg" alt="Monad Blitz Logo" className="h-12" />
          </div>
        </div> */}

        <div className="fixed opacity-20 z-0 top-[-50px]">
          <img src="/iplikci-logo.png" alt="FIplikci" className="h-[800px]" />
        </div>

        <div className="text-right max-w-4xl mx-auto z-10">
          <div className="text-4xl font-light mb-3 text-gray-400">FIplikci</div>
          <h1 className="text-7xl font-bold mb-6">
            TRUST-BASED
            <br />
            <span className="text-monad-green">DEFI LENDING</span>
            <br />
            ON MONAD
          </h1>
          <p className="text-xl text-gray-400 mb-12 max-w-xl ml-auto">
            Lower your collateral ratio from 150% to 50% based on your payment history. Build trust, unlock capital
            efficiency.
          </p>

          {/* CTA Buttons */}
          <div className="flex justify-end gap-4 mb-24 pr-[28px]">
            {/* <button
              onClick={() => {
                if (connectors[0]) {
                  connect({ connector: connectors[0] });
                }
              }}
              className="px-8 py-3 bg-monad-green text-black font-bold rounded-lg hover:opacity-90 transition-opacity"
            >
              Launch App
            </button>
            <Link
              href="/docs"
              className="px-8 py-3 bg-monad-dark-gray text-white font-bold rounded-lg hover:bg-gray-800 transition-colors border border-gray-700"
            >
              Learn More
            </Link> */}

            <div className="scale-150">
              <RainbowKitCustomConnectButton />
            </div>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-8 bg-monad-dark-gray rounded-lg border border-gray-800">
              <div className="mb-4 bg-monad-dark-green rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-monad-green" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-6h2v2h-2v-2zm0-8h2v6h-2V6z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Trust Score System</h3>
              <p className="text-gray-400">
                Build reputation with every on-time payment. Lower collateral requirements over time.
              </p>
            </div>

            <div className="p-8 bg-monad-dark-gray rounded-lg border border-gray-800">
              <div className="mb-4 bg-monad-dark-green rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-monad-green" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Dynamic Collateral</h3>
              <p className="text-gray-400">Start at 90%, drop to 50%. Your payment history determines your ratio.</p>
            </div>

            <div className="p-8 bg-monad-dark-gray rounded-lg border border-gray-800">
              <div className="mb-4 bg-monad-dark-green rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-monad-green" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Instant Rewards</h3>
              <p className="text-gray-400">Earn staking rewards and yield farming bonuses for reliable payments.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
