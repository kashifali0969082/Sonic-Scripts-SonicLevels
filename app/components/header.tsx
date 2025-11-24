"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useUIStore } from "../store/toggleStore";
import Link from "next/link";
import { useState } from "react";
import { useSwitchChain } from "wagmi";
 import { sonic } from "../../config/customChain";
 import { sepolia } from "viem/chains";
 import { useEffect } from "react";
import { useAccount, useChainId } from "wagmi";
import { toast } from "react-toastify";
export function Header() {
  const { on, toggle, network, toggleNetwork } = useUIStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { switchChain } = useSwitchChain();
  const { isConnected } = useAccount();
  const currentChainId = useChainId();

  const handleNetworkToggle = () => {
    const newNetworkState = !network; // Get the new state after toggle
    toggleNetwork();
    
    // Only switch wallet chain if wallet is connected
    if (isConnected && switchChain) {
      const targetChainId = newNetworkState ? sonic.id : sepolia.id;
      if (currentChainId !== targetChainId) {
        switchChain({ chainId: targetChainId });
      }
    }
  };

  useEffect(() => {
    // Only auto-switch wallet chain if wallet is connected
    if (!switchChain || !isConnected) return;
  
    const targetChainId = network ? sonic.id : sepolia.id;
    
    // Only switch if we're not already on the target chain
    if (currentChainId !== targetChainId) {
      switchChain({ chainId: targetChainId });
    }
  }, [network, switchChain, isConnected, currentChainId]);
  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 hover:scale-105 transform transition-all duration-300"
          >
            Web3 App
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/"
              className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors duration-300"
            >
              Home
            </Link>
          
         
          </nav>

          <div className="flex items-center gap-4">
            <ConnectButton />

            <button
              className="md:hidden text-gray-700 dark:text-gray-300"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {mobileMenuOpen ? (
                  <path d="M6 18L18 6M6 6l12 12"></path>
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16"></path>
                )}
              </svg>
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <nav className="md:hidden mt-4 pb-4 flex flex-col gap-4 border-t border-gray-200 dark:border-gray-700 pt-4">
            <Link
              href="/"
              className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors duration-300"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/about"
              className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors duration-300"
              onClick={() => setMobileMenuOpen(false)}
            >
              About
            </Link>
            <Link
              href="/pricing"
              className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors duration-300"
              onClick={() => setMobileMenuOpen(false)}
            >
              Pricing
            </Link>
          </nav>
        )}

        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          {/* <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {on ? "Backend Scripts" : "Frontend Testing"}
            </span>
            <div
              onClick={toggle}
              className="relative w-16 h-8 flex items-center bg-gray-300 dark:bg-gray-600 rounded-full p-1 cursor-pointer hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
            >
              <div
                className={`bg-blue-600 w-6 h-6 rounded-full shadow-md transform transition-all ${
                  on ? "translate-x-8" : "translate-x-0"
                }`}
              />
            </div>
          </div> */}

          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {network ? "Sonic Mainnet" : "Monad Mainnet"}
            </span>
            <div
              onClick={handleNetworkToggle}
              className="relative w-16 h-8 flex items-center bg-gray-300 dark:bg-gray-600 rounded-full p-1 cursor-pointer hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
            >
              <div
                className={`bg-purple-600 w-6 h-6 rounded-full shadow-md transform transition-all ${
                  network ? "translate-x-8" : "translate-x-0"
                }`}
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
