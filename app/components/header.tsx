"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useUIStore } from "../store/toggleStore";

export function Header() {
  const { on, toggle, network, toggleNetwork } = useUIStore();

  return (
    <div className="p-4 bg-gray-200 dark:bg-gray-800 border-b flex flex-col gap-4">

      {/* FIRST ROW */}
      <div className="flex items-center justify-between">

        {/* Label for Push Mode Toggle */}
        <span className="mr-3 font-medium text-sm">
          {on ? "BackendScriptsPush" : "FrontendTesting"}
        </span>

        {/* Toggle Switch 1 */}
        <div
          onClick={toggle}
          className="relative w-16 h-8 flex items-center bg-gray-300 rounded-full p-1 cursor-pointer"
        >
          <div
            className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-all ${
              on ? "translate-x-8" : "translate-x-0"
            }`}
          />
        </div>

        <ConnectButton />
      </div>

      {/* SECOND ROW */}
      <div className="flex items-center justify-between">

        {/* Label for Network Toggle */}
        <span className="mr-3 font-medium text-sm">
          {network ? "Sonic Mainnet" : "Testnet"}
        </span>

        {/* Toggle Switch 2 */}
        <div
          onClick={toggleNetwork}
          className="relative w-16 h-8 flex items-center bg-gray-300 rounded-full p-1 cursor-pointer"
        >
          <div
            className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-all ${
              network ? "translate-x-8" : "translate-x-0"
            }`}
          />
        </div>
      </div>
    </div>
  );
}
