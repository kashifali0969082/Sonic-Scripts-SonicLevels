"use client";

import React, { useState, useEffect } from 'react';
import { Gift, Heart, Users, Target, Wallet, Copy, Check, Download, Star, Snowflake, ChevronRight, Menu, X, ExternalLink } from 'lucide-react';

declare global {
  interface Window {
    ethereum?: any;
  }
}

interface Snowflake {
  id: number;
  left: number;
  animationDuration: number;
  animationDelay: number;
  size: number;
}

interface DonationTier {
  name: string;
  amount: number;
  icon: string;
  description: string;
}

interface Badge {
  name: string;
  icon: string;
  minAmount: number;
}

const ChristmasCharityApp = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [showDonationModal, setShowDonationModal] = useState(false);
  const [donationType, setDonationType] = useState('crypto');
  const [selectedTier, setSelectedTier] = useState<DonationTier | null>(null);
  const [donationAmount, setDonationAmount] = useState('');
  const [donorName, setDonorName] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [txHash, setTxHash] = useState('');
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [totalDonations, setTotalDonations] = useState(47850);
  const [donorCount, setDonorCount] = useState(342);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [snowflakes, setSnowflakes] = useState<Snowflake[]>([]);

  const GOAL_AMOUNT = 100000;
  const CHARITY_WALLET = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb9';

  const donationTiers: DonationTier[] = [
    { name: "Gift a Meal", amount: 10, icon: "🎁", description: "Provide a warm meal for a family" },
    { name: "Stocking of Hope", amount: 50, icon: "🧦", description: "Essential supplies and care packages" },
    { name: "Santa's Sleigh", amount: 250, icon: "🛷", description: "Major impact on community programs" },
    { name: "North Pole Sponsor", amount: 1000, icon: "⭐", description: "Transform lives this Christmas season" }
  ];

  const badges: Badge[] = [
    { name: "Snowflake Supporter", icon: "❄️", minAmount: 10 },
    { name: "Reindeer Friend", icon: "🦌", minAmount: 50 },
    { name: "Santa's Helper", icon: "🎅", minAmount: 250 },
    { name: "Christmas Star", icon: "⭐", minAmount: 1000 }
  ];

  useEffect(() => {
    const newSnowflakes = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      animationDuration: 10 + Math.random() * 20,
      animationDelay: Math.random() * 10,
      size: 2 + Math.random() * 4
    }));
    setSnowflakes(newSnowflakes);
  }, []);

  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setWalletAddress(accounts[0]);
        setWalletConnected(true);
      } catch (error) {
        alert('Please install MetaMask or another Web3 wallet');
      }
    } else {
      alert('Please install MetaMask to connect your wallet');
    }
  };

  const processDonation = async () => {
    const amount = parseFloat(donationAmount);
    if (!donationAmount || isNaN(amount) || amount <= 0) {
      alert('Please enter a valid donation amount');
      return;
    }

    if (donationType === 'crypto' && !walletConnected) {
      alert('Please connect your wallet first');
      return;
    }

    const mockTxHash = '0x' + Array.from({ length: 64 }, () => 
      Math.floor(Math.random() * 16).toString(16)).join('');
    
    setTxHash(mockTxHash);
    
    const newTotal = totalDonations + amount;
    setTotalDonations(newTotal);
    setDonorCount(donorCount + 1);
    
    setShowDonationModal(false);
    setShowSuccess(true);

    setTimeout(() => {
      const confetti = document.createElement('div');
      confetti.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 100px;
        animation: celebrate 2s ease-out;
        pointer-events: none;
        z-index: 10000;
      `;
      confetti.innerHTML = '🎉🎄✨';
      document.body.appendChild(confetti);
      setTimeout(() => confetti.remove(), 2000);
    }, 100);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  const downloadReceipt = () => {
    const receipt = `
Christmas Charity Donation Receipt
═══════════════════════════════════════
Donor: ${donorName || 'Anonymous'}
Amount: $${donationAmount} USD
Transaction: ${txHash}
Date: ${new Date().toLocaleString()}
═══════════════════════════════════════
Thank you for spreading Christmas joy! 🎄
    `;
    const blob = new Blob([receipt], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `christmas-donation-receipt-${Date.now()}.txt`;
    a.click();
  };

  const getBadge = (amount: number): Badge => {
    const reversedBadges = [...badges].reverse();
    return reversedBadges.find(b => amount >= b.minAmount) || badges[0];
  };

  const progressPercent = Math.min((totalDonations / GOAL_AMOUNT) * 100, 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none z-50">
        {snowflakes.map(flake => (
          <div
            key={flake.id}
            className="absolute text-white opacity-70"
            style={{
              left: `${flake.left}%`,
              top: '-10px',
              animation: `fall ${flake.animationDuration}s linear infinite`,
              animationDelay: `${flake.animationDelay}s`,
              fontSize: `${flake.size}px`
            }}
          >
            ❄
          </div>
        ))}
      </div>

      <style>{`
        @keyframes fall {
          to { transform: translateY(100vh); }
        }
        @keyframes celebrate {
          0% { transform: translate(-50%, -50%) scale(0) rotate(0deg); opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(2) rotate(360deg); opacity: 0; }
        }
        @keyframes glow {
          0%, 100% { text-shadow: 0 0 10px rgba(255,215,0,0.5), 0 0 20px rgba(255,215,0,0.3); }
          50% { text-shadow: 0 0 20px rgba(255,215,0,0.8), 0 0 30px rgba(255,215,0,0.5); }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7), 0 0 0 0 rgba(34, 197, 94, 0.4); }
          50% { box-shadow: 0 0 0 8px rgba(34, 197, 94, 0), 0 0 0 4px rgba(34, 197, 94, 0); }
        }
        @keyframes wave {
          0%, 100% { transform: translateX(0) scaleY(1); }
          50% { transform: translateX(5px) scaleY(1.05); }
        }
        @keyframes progressFill {
          0% { width: 0%; }
        }
        @keyframes bounce {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(10px); }
        }
        .glow-text {
          animation: glow 2s ease-in-out infinite;
        }
        .progress-bar-animated {
          background: linear-gradient(
            90deg,
            rgba(34, 197, 94, 0.8) 0%,
            rgba(34, 197, 94, 1) 25%,
            rgba(74, 222, 128, 1) 50%,
            rgba(34, 197, 94, 1) 75%,
            rgba(34, 197, 94, 0.8) 100%
          );
          background-size: 200% 100%;
          animation: shimmer 3s linear infinite, pulse 2s ease-in-out infinite;
          position: relative;
          overflow: hidden;
        }
        .progress-bar-animated::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.4),
            transparent
          );
          animation: shimmer 2s linear infinite;
        }
        .progress-bar-fill {
          animation: progressFill 1.5s ease-out;
        }
        .progress-emoji {
          animation: bounce 1.5s ease-in-out infinite;
        }
      `}</style>

      <nav className="bg-gradient-to-r from-red-600 to-red-700 shadow-xl relative z-50 sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 md:h-20">
            <div 
              className="flex items-center gap-3 cursor-pointer group" 
              onClick={() => setCurrentPage('home')}
            >
              <div className="bg-white/20 p-2 rounded-lg group-hover:bg-white/30 transition">
                <Gift className="text-white" size={28} />
              </div>
              <span className="text-white font-bold text-lg sm:text-xl">Christmas Charity</span>
            </div>
            
            <div className="hidden md:flex items-center gap-8">
              <button 
                onClick={() => setCurrentPage('home')} 
                className={`text-white font-medium transition-all duration-200 pb-1 border-b-2 ${
                  currentPage === 'home' 
                    ? 'border-green-300 text-green-200' 
                    : 'border-transparent hover:border-white/50'
                }`}
              >
                Home
              </button>
              <button 
                onClick={() => setCurrentPage('campaigns')} 
                className={`text-white font-medium transition-all duration-200 pb-1 border-b-2 ${
                  currentPage === 'campaigns' 
                    ? 'border-green-300 text-green-200' 
                    : 'border-transparent hover:border-white/50'
                }`}
              >
                Campaigns
              </button>
              <button 
                onClick={() => setCurrentPage('about')} 
                className={`text-white font-medium transition-all duration-200 pb-1 border-b-2 ${
                  currentPage === 'about' 
                    ? 'border-green-300 text-green-200' 
                    : 'border-transparent hover:border-white/50'
                }`}
              >
                About
              </button>
              
              {!walletConnected ? (
                <button
                  onClick={connectWallet}
                  className="bg-green-500 text-white px-5 py-2.5 rounded-full hover:bg-green-600 transition-all duration-200 flex items-center gap-2 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <Wallet size={18} />
                  Connect Wallet
                </button>
              ) : (
                <div className="bg-green-500 text-white px-5 py-2.5 rounded-full flex items-center gap-2 shadow-lg">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  <span className="font-medium">{walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</span>
                </div>
              )}
            </div>

            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
              className="md:hidden text-white p-2 hover:bg-white/10 rounded-lg transition"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-red-700 border-t border-red-800 pb-4 animate-in slide-in-from-top">
            <button 
              onClick={() => { setCurrentPage('home'); setMobileMenuOpen(false); }} 
              className="block w-full text-left px-6 py-3 text-white hover:bg-red-800 transition font-medium"
            >
              Home
            </button>
            <button 
              onClick={() => { setCurrentPage('campaigns'); setMobileMenuOpen(false); }} 
              className="block w-full text-left px-6 py-3 text-white hover:bg-red-800 transition font-medium"
            >
              Campaigns
            </button>
            <button 
              onClick={() => { setCurrentPage('about'); setMobileMenuOpen(false); }} 
              className="block w-full text-left px-6 py-3 text-white hover:bg-red-800 transition font-medium"
            >
              About
            </button>
            {!walletConnected && (
              <div className="px-6 pt-2">
                <button
                  onClick={() => { connectWallet(); setMobileMenuOpen(false); }}
                  className="w-full bg-green-500 text-white px-4 py-2.5 rounded-full hover:bg-green-600 transition flex items-center justify-center gap-2 font-semibold"
                >
                  <Wallet size={18} />
                  Connect Wallet
                </button>
              </div>
            )}
          </div>
        )}
      </nav>

      {currentPage === 'home' && (
        <div className="relative z-10">
          <div className="bg-gradient-to-br from-red-600 via-red-500 to-green-600 text-white py-24 md:py-32 relative overflow-hidden">
            <div className="absolute inset-0 opacity-5">
              <div className="text-9xl absolute top-10 left-10 animate-pulse">🎄</div>
              <div className="text-9xl absolute bottom-10 right-10 animate-pulse" style={{ animationDelay: '1s' }}>⛄</div>
              <div className="text-7xl absolute top-1/2 left-1/4 animate-pulse" style={{ animationDelay: '0.5s' }}>❄️</div>
              <div className="text-7xl absolute top-1/3 right-1/4 animate-pulse" style={{ animationDelay: '1.5s' }}>🎁</div>
            </div>
            
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6 glow-text leading-tight">
                Spread Christmas Joy 🎅
              </h1>
              <p className="text-lg sm:text-xl md:text-2xl mb-10 opacity-95 max-w-3xl mx-auto leading-relaxed">
                Help us bring warmth, food, and hope to families in need this holiday season
              </p>
              
              <div className="bg-white/25 backdrop-blur-md rounded-3xl p-6 sm:p-8 mb-10 shadow-2xl border border-white/30">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mb-4">
                  <div className="text-left">
                    <p className="text-xs sm:text-sm text-white/80 mb-1">Total Raised</p>
                    <p className="text-2xl sm:text-3xl font-bold">${totalDonations.toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs sm:text-sm text-white/80 mb-1">Goal</p>
                    <p className="text-2xl sm:text-3xl font-bold">${GOAL_AMOUNT.toLocaleString()}</p>
                  </div>
                </div>
                <div className="relative h-12 sm:h-14 bg-white/20 rounded-full overflow-hidden shadow-inner border-2 border-white/30 mb-4">
                  <div 
                    className="absolute inset-y-0 left-0 progress-bar-animated progress-bar-fill rounded-full flex items-center justify-end pr-4 transition-all duration-1000 ease-out"
                    style={{ width: `${progressPercent}%` }}
                  >
                    <span className="progress-emoji text-white font-bold text-lg sm:text-xl drop-shadow-lg">🎄</span>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-white font-bold text-sm sm:text-base z-10">{progressPercent.toFixed(1)}%</span>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm sm:text-base">
                  <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
                    <Users size={18} className="text-green-200" />
                    <span className="font-semibold">{donorCount} donors</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
                    <Target size={18} className="text-green-200" />
                    <span className="font-semibold">{progressPercent.toFixed(1)}% complete</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button
                  onClick={() => { setDonationType('crypto'); setShowDonationModal(true); }}
                  className="group bg-white text-red-600 px-8 py-4 rounded-full font-bold text-base sm:text-lg hover:bg-green-50 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl flex items-center justify-center gap-3 shadow-xl w-full sm:w-auto min-w-[200px]"
                >
                  <Wallet size={24} className="group-hover:rotate-12 transition-transform" />
                  Donate with Crypto
                </button>
                <button
                  onClick={() => { setDonationType('card'); setShowDonationModal(true); }}
                  className="group bg-green-500 text-white px-8 py-4 rounded-full font-bold text-base sm:text-lg hover:bg-green-600 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl flex items-center justify-center gap-3 shadow-xl w-full sm:w-auto min-w-[200px]"
                >
                  <Heart size={24} className="group-hover:scale-110 transition-transform" />
                  Donate with Card
                </button>
              </div>
            </div>
          </div>

          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-10 border border-gray-200">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-500 to-green-500 rounded-full mb-4">
                  <Gift size={32} className="text-white" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
                  Charity Treasury Wallet
                </h2>
                <p className="text-gray-600 text-sm sm:text-base">Send donations directly to our secure wallet</p>
              </div>
              
              <div className="bg-gradient-to-br from-green-50 to-red-50 rounded-2xl p-6 sm:p-8 mb-8 border border-green-200">
                <p className="text-sm sm:text-base text-gray-700 mb-4 font-semibold flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  Wallet Address
                </p>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-white p-4 rounded-xl border-2 border-gray-200 shadow-sm">
                  <code className="flex-1 text-xs sm:text-sm break-all text-gray-800 font-mono bg-gray-50 p-3 rounded-lg">
                    {CHARITY_WALLET}
                  </code>
                  <button
                    onClick={() => copyToClipboard(CHARITY_WALLET)}
                    className={`${
                      copiedAddress 
                        ? 'bg-green-500 hover:bg-green-600' 
                        : 'bg-red-500 hover:bg-red-600'
                    } text-white px-4 py-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 font-semibold shadow-md hover:shadow-lg transform hover:scale-105 flex-shrink-0`}
                  >
                    {copiedAddress ? (
                      <>
                        <Check size={18} />
                        <span className="text-sm">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={18} />
                        <span className="text-sm">Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
              
              <div className="flex justify-center">
                <div className="bg-white p-6 rounded-2xl border-2 border-gray-200 shadow-lg">
                  <div className="w-48 h-48 sm:w-56 sm:h-56 bg-gradient-to-br from-red-100 via-white to-green-100 rounded-xl flex items-center justify-center border-2 border-gray-200 shadow-inner">
                    <div className="text-center">
                      <div className="text-6xl mb-2">📱</div>
                      <div className="w-32 h-32 sm:w-40 sm:h-40 bg-white border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center mx-auto">
                        <span className="text-gray-400 text-xs">QR Code</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-center text-sm text-gray-600 mt-4 font-medium">Scan QR code to donate</p>
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl p-8 text-center border-t-4 border-red-500 transition-all duration-300 transform hover:-translate-y-2 group">
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">🎁</div>
                <div className="text-4xl font-bold text-red-600 mb-2">${totalDonations.toLocaleString()}</div>
                <div className="text-gray-600 font-medium">Total Raised</div>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-500">Growing every day</p>
                </div>
              </div>
              <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl p-8 text-center border-t-4 border-green-500 transition-all duration-300 transform hover:-translate-y-2 group">
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">👥</div>
                <div className="text-4xl font-bold text-green-600 mb-2">{donorCount}</div>
                <div className="text-gray-600 font-medium">Generous Donors</div>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-500">Join our community</p>
                </div>
              </div>
              <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl p-8 text-center border-t-4 border-yellow-500 transition-all duration-300 transform hover:-translate-y-2 group sm:col-span-2 lg:col-span-1">
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">🎄</div>
                <div className="text-4xl font-bold text-yellow-600 mb-2">{Math.floor(totalDonations / 10)}</div>
                <div className="text-gray-600 font-medium">Families Helped</div>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-500">Making a real difference</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {currentPage === 'campaigns' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 relative z-10">
          <div className="text-center mb-12 sm:mb-16">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              🎄 Christmas Donation Tiers 🎄
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Choose a donation tier that matches your generosity and make a meaningful impact
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mb-16">
            {donationTiers.map((tier, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl p-6 sm:p-8 border-2 border-gray-200 hover:border-green-400 transition-all duration-300 transform hover:-translate-y-2 cursor-pointer group"
                onClick={() => {
                  setSelectedTier(tier);
                  setDonationAmount(tier.amount.toString());
                  setShowDonationModal(true);
                }}
              >
                <div className="text-6xl mb-4 text-center group-hover:scale-110 transition-transform">{tier.icon}</div>
                <h3 className="text-xl font-bold text-red-600 text-center mb-3">{tier.name}</h3>
                <div className="text-4xl font-bold text-green-600 text-center mb-4">
                  ${tier.amount}
                </div>
                <p className="text-gray-600 text-center text-sm mb-6 leading-relaxed min-h-[3rem]">{tier.description}</p>
                <button className="w-full bg-gradient-to-r from-red-500 to-green-500 text-white py-3 rounded-xl font-semibold hover:from-red-600 hover:to-green-600 transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg group-hover:scale-105">
                  Donate Now <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-br from-white to-green-50 rounded-3xl shadow-xl p-8 sm:p-12 border-2 border-green-200">
            <div className="text-center mb-10">
              <h2 className="text-3xl sm:text-4xl font-bold text-green-600 mb-4">
                🌟 Donor Badges 🌟
              </h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                Earn special Christmas badges based on your donation amount and showcase your generosity!
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
              {badges.map((badge, idx) => (
                <div 
                  key={idx} 
                  className="text-center bg-white p-6 rounded-2xl border-2 border-gray-100 hover:border-green-300 transition-all duration-300 transform hover:-translate-y-1 group"
                >
                  <div className="text-7xl mb-4 group-hover:scale-110 transition-transform">{badge.icon}</div>
                  <div className="font-bold text-gray-800 text-lg mb-2">{badge.name}</div>
                  <div className="text-sm font-semibold text-green-600 bg-green-50 px-4 py-2 rounded-full inline-block">
                    ${badge.minAmount}+
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {currentPage === 'about' && (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 relative z-10">
          <div className="bg-white rounded-3xl shadow-2xl p-8 sm:p-12 border border-gray-200">
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-500 to-green-500 rounded-full mb-6">
                <span className="text-4xl">🎅</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-800 mb-4">
                About Our Mission
              </h1>
              <div className="w-24 h-1 bg-gradient-to-r from-red-500 to-green-500 mx-auto rounded-full"></div>
            </div>
            
            <div className="prose max-w-none">
              <p className="text-lg sm:text-xl text-gray-700 mb-8 leading-relaxed text-center max-w-3xl mx-auto">
                Welcome to Christmas Charity - a blockchain-powered platform bringing holiday joy to families in need. 
                This holiday season, we're on a mission to raise funds that will provide meals, warm clothing, and 
                essential supplies to underserved communities.
              </p>

              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 mb-8 border-2 border-green-200">
                <h2 className="text-2xl sm:text-3xl font-bold text-green-700 mb-6 flex items-center gap-3">
                  <span>💚</span> Why We're Different
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-xl border border-green-200">
                    <div className="text-2xl mb-2">✨</div>
                    <p className="font-semibold text-gray-800">100% Transparent</p>
                    <p className="text-sm text-gray-600 mt-1">Blockchain donations</p>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-green-200">
                    <div className="text-2xl mb-2">🎯</div>
                    <p className="font-semibold text-gray-800">On-Chain Tracking</p>
                    <p className="text-sm text-gray-600 mt-1">Every dollar tracked</p>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-green-200">
                    <div className="text-2xl mb-2">🤝</div>
                    <p className="font-semibold text-gray-800">Direct Support</p>
                    <p className="text-sm text-gray-600 mt-1">Verified families</p>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-green-200">
                    <div className="text-2xl mb-2">🎄</div>
                    <p className="font-semibold text-gray-800">Real-Time Impact</p>
                    <p className="text-sm text-gray-600 mt-1">Live tracking</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl p-8 border-2 border-red-200">
                <h2 className="text-2xl sm:text-3xl font-bold text-red-700 mb-6 flex items-center gap-3">
                  <span>📞</span> Contact Us
                </h2>
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-xl border border-red-200 flex items-start gap-4">
                    <div className="text-2xl">📧</div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">Email</p>
                      <p className="text-gray-800 font-medium">hello@christmascharity.org</p>
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-red-200 flex items-start gap-4">
                    <div className="text-2xl">📱</div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">Phone</p>
                      <p className="text-gray-800 font-medium">+1 (555) 123-4567</p>
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-red-200 flex items-start gap-4">
                    <div className="text-2xl">📍</div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">Address</p>
                      <p className="text-gray-800 font-medium">123 Holiday Lane, North Pole, NP 88888</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-10 text-center">
                <button
                  onClick={() => setCurrentPage('home')}
                  className="bg-gradient-to-r from-red-500 to-green-500 text-white px-8 py-4 rounded-full font-bold text-lg hover:from-red-600 hover:to-green-600 transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:scale-105"
                >
                  Start Donating 🎁
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDonationModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-gray-200 animate-in zoom-in-95">
            <div className="bg-gradient-to-r from-red-500 to-green-500 text-white p-6 rounded-t-3xl">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-lg">
                    {donationType === 'crypto' ? '🪙' : '💳'}
                  </div>
                  <h2 className="text-2xl font-bold">
                    {donationType === 'crypto' ? 'Crypto Donation' : 'Card Donation'}
                  </h2>
                </div>
                <button 
                  onClick={() => setShowDonationModal(false)} 
                  className="text-white hover:bg-white/20 p-2 rounded-lg transition"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="p-6 sm:p-8">
              {donationType === 'crypto' && !walletConnected && (
                <div className="mb-6 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-xl">
                  <p className="text-sm text-yellow-800 mb-3 font-medium">Please connect your wallet to continue</p>
                  <button
                    onClick={connectWallet}
                    className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition-all duration-200 flex items-center justify-center gap-2 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <Wallet size={20} />
                    Connect Wallet
                  </button>
                </div>
              )}

              <div className="mb-5">
                <label className="block text-gray-700 font-semibold mb-2.5 text-sm">Your Name (Optional)</label>
                <input
                  type="text"
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  placeholder="Enter your name or remain anonymous"
                  className="w-full border-2 border-gray-300 rounded-xl p-3.5 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none transition-all text-gray-800 placeholder-gray-400"
                />
              </div>

              <div className="mb-5">
                <label className="block text-gray-700 font-semibold mb-2.5 text-sm">Donation Amount (USD)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">$</span>
                  <input
                    type="number"
                    value={donationAmount}
                    onChange={(e) => setDonationAmount(e.target.value)}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    className="w-full border-2 border-gray-300 rounded-xl p-3.5 pl-8 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none transition-all text-lg font-semibold text-gray-800"
                  />
                </div>
              </div>

              {donationType === 'crypto' && walletConnected && (
                <div className="mb-5 bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border-2 border-green-200">
                  <p className="text-xs text-gray-600 mb-1.5 font-medium">Payment Token</p>
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-green-700">USDC</p>
                    <p className="text-xs text-gray-600">Polygon Network</p>
                  </div>
                </div>
              )}

              {selectedTier && (
                <div className="mb-5 bg-gradient-to-br from-yellow-50 to-amber-50 p-4 rounded-xl border-2 border-yellow-300 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="text-4xl">{selectedTier.icon}</div>
                    <div className="flex-1">
                      <div className="font-bold text-gray-800 text-lg">{selectedTier.name}</div>
                      <div className="text-sm text-gray-600 mt-1">{selectedTier.description}</div>
                      <div className="text-lg font-bold text-green-600 mt-2">${selectedTier.amount}</div>
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={processDonation}
                className="w-full bg-gradient-to-r from-red-500 to-green-500 text-white py-4 rounded-xl font-bold text-lg hover:from-red-600 hover:to-green-600 transition-all duration-200 flex items-center justify-center gap-2 shadow-xl hover:shadow-2xl transform hover:scale-105 mb-4"
              >
                <Heart size={24} />
                Complete Donation
              </button>

              <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                <span>🔒</span>
                <span>Secure and transparent</span>
                <span>•</span>
                <span>All transactions recorded on-chain</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {showSuccess && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full border-2 border-green-300 relative overflow-hidden animate-in zoom-in-95">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-green-500 to-red-500"></div>
            
            <div className="p-8 sm:p-10 text-center">
              <div className="text-7xl mb-6 animate-bounce">🎉</div>
              <h2 className="text-3xl font-bold text-green-600 mb-3">
                Thank You! 🎄
              </h2>
              <p className="text-base text-gray-700 mb-6 leading-relaxed">
                Your generous donation of <span className="font-bold text-red-600 text-lg">${donationAmount}</span> will bring 
                Christmas joy to families in need!
              </p>

              {donationAmount && (
                <div className="bg-gradient-to-br from-yellow-50 via-amber-50 to-green-50 p-6 rounded-2xl mb-6 border-2 border-yellow-300 shadow-lg">
                  <div className="text-6xl mb-3">{getBadge(parseFloat(donationAmount)).icon}</div>
                  <div className="font-bold text-xl text-gray-800 mb-1">{getBadge(parseFloat(donationAmount)).name}</div>
                  <div className="text-sm text-gray-600">You've earned this badge! ✨</div>
                </div>
              )}

              <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-5 rounded-xl mb-6 text-left border border-gray-200">
                <div className="mb-4 pb-4 border-b border-gray-300">
                  <span className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Donor</span>
                  <div className="font-bold text-gray-800 mt-1 text-lg">{donorName || 'Anonymous'}</div>
                </div>
                <div className="mb-4 pb-4 border-b border-gray-300">
                  <span className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Transaction Hash</span>
                  <div className="font-mono text-xs break-all bg-white p-3 rounded-lg mt-2 flex items-center gap-2 border border-gray-200">
                    <span className="flex-1 text-gray-700">{txHash}</span>
                    <button
                      onClick={() => copyToClipboard(txHash)}
                      className={`${
                        copiedAddress ? 'bg-green-500 hover:bg-green-600' : 'bg-blue-500 hover:bg-blue-600'
                      } text-white p-2 rounded-lg transition flex-shrink-0`}
                    >
                      {copiedAddress ? <Check size={16} /> : <Copy size={16} />}
                    </button>
                  </div>
                </div>
                <div>
                  <span className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Date</span>
                  <div className="font-semibold text-gray-800 mt-1">{new Date().toLocaleString()}</div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={downloadReceipt}
                  className="flex-1 bg-red-500 text-white py-3.5 rounded-xl hover:bg-red-600 transition-all duration-200 flex items-center justify-center gap-2 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <Download size={20} />
                  Download Receipt
                </button>
                <button
                  onClick={() => setShowSuccess(false)}
                  className="flex-1 bg-green-500 text-white py-3.5 rounded-xl hover:bg-green-600 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <footer className="bg-gradient-to-r from-red-600 to-red-700 text-white py-12 mt-16 relative z-10 border-t border-red-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">🎄</div>
            <p className="text-xl sm:text-2xl font-bold mb-2">Christmas Charity</p>
            <p className="text-sm sm:text-base opacity-90 mb-6">Spreading joy and hope this holiday season</p>
            <div className="flex justify-center gap-3 sm:gap-4 text-2xl">
              <span className="hover:scale-125 transition-transform cursor-default">❄️</span>
              <span className="hover:scale-125 transition-transform cursor-default">🎅</span>
              <span className="hover:scale-125 transition-transform cursor-default">🎁</span>
              <span className="hover:scale-125 transition-transform cursor-default">✨</span>
              <span className="hover:scale-125 transition-transform cursor-default">🦌</span>
            </div>
          </div>
          <div className="border-t border-white/20 pt-6 text-center">
            <p className="text-sm opacity-80">© 2024 Christmas Charity. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ChristmasCharityApp;