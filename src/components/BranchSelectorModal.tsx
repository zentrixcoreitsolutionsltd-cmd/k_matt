import React, { useState } from 'react';
import { MapPin, Navigation, CheckCircle2, Search, Building2, Phone, X, ShieldCheck, ArrowRight } from 'lucide-react';
import { Branch } from '../types';
import { BRANCHES } from '../data/branches';

interface BranchSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedBranchId: string;
  onSelectBranch: (branchId: string) => void;
  onShowToast?: (msg: string, type: 'success' | 'info' | 'error') => void;
}

export default function BranchSelectorModal({
  isOpen,
  onClose,
  selectedBranchId,
  onSelectBranch,
  onShowToast,
}: BranchSelectorModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDetecting, setIsDetecting] = useState(false);

  if (!isOpen) return null;

  const filteredBranches = BRANCHES.filter(
    (b) =>
      b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.town.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.county.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedBranch = BRANCHES.find((b) => b.id === selectedBranchId) || BRANCHES[0];

  const handleSelect = (branch: Branch) => {
    onSelectBranch(branch.id);
    if (onShowToast) {
      onShowToast(`Switched K-Matt Store Branch to ${branch.name}`, 'success');
    }
    onClose();
  };

  const handleAutoDetect = () => {
    setIsDetecting(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setIsDetecting(false);
          // Default to Kericho or Nakuru based on random approximation or Kericho default
          const lat = position.coords.latitude;
          let matchedId = 'kericho';
          if (lat > -0.2) matchedId = 'nakuru';
          if (lat > 0.3) matchedId = 'eldoret';
          if (lat < -0.8) matchedId = 'bomet';

          const matched = BRANCHES.find((b) => b.id === matchedId) || BRANCHES[0];
          handleSelect(matched);
        },
        () => {
          setIsDetecting(false);
          // Fallback to Kericho
          const defaultB = BRANCHES.find((b) => b.id === 'kericho') || BRANCHES[0];
          handleSelect(defaultB);
        },
        { timeout: 5000 }
      );
    } else {
      setIsDetecting(false);
      const defaultB = BRANCHES.find((b) => b.id === 'kericho') || BRANCHES[0];
      handleSelect(defaultB);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-plum text-white px-6 py-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2.5 rounded-2xl">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight">Select K-Matt Store Branch</h2>
              <p className="text-xs text-white/80 font-medium">
                View real-time stock availability and place orders for your local branch
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/80 hover:text-white"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Active Banner */}
        <div className="bg-plum-fade dark:bg-gray-800/80 px-6 py-3 border-b border-plum/10 dark:border-gray-700/60 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <MapPin className="w-4 h-4 text-plum dark:text-pink-400 shrink-0" />
            <span className="text-xs text-gray-700 dark:text-gray-200">
              Active Branch: <strong className="text-plum dark:text-pink-300 font-extrabold">{selectedBranch.name}</strong> ({selectedBranch.county} County)
            </span>
          </div>
          <button
            onClick={handleAutoDetect}
            disabled={isDetecting}
            className="text-xs font-black text-plum dark:text-pink-400 hover:underline flex items-center gap-1 bg-white dark:bg-gray-900 px-3 py-1.5 rounded-xl border border-plum/20 dark:border-gray-700 shadow-2xs"
          >
            <Navigation className={`w-3.5 h-3.5 ${isDetecting ? 'animate-spin' : ''}`} />
            <span>{isDetecting ? 'Detecting Location...' : 'Auto-Detect Nearest'}</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-6 pb-3 shrink-0">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search branch name, town, or county (e.g. Kericho, Nakuru, Eldoret...)"
              className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-2xl text-xs font-semibold text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-plum/30"
            />
          </div>
        </div>

        {/* Branch List */}
        <div className="p-6 pt-2 overflow-y-auto space-y-3 flex-1">
          {filteredBranches.length === 0 ? (
            <div className="text-center py-8 text-gray-500 space-y-2">
              <Building2 className="w-8 h-8 mx-auto text-gray-300 dark:text-gray-600" />
              <p className="text-xs font-bold">No branches match "{searchTerm}"</p>
              <p className="text-[11px] text-gray-400">Try searching for Kericho, Nakuru, Eldoret, Kisumu, Bomet, or Nairobi.</p>
            </div>
          ) : (
            filteredBranches.map((branch) => {
              const isSelected = branch.id === selectedBranchId;
              return (
                <div
                  key={branch.id}
                  onClick={() => handleSelect(branch)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-plum-fade/70 dark:bg-gray-800 border-plum dark:border-pink-500 shadow-xs'
                      : 'bg-white dark:bg-gray-800/40 border-gray-200 dark:border-gray-700/80 hover:border-plum/40 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-extrabold text-sm text-gray-900 dark:text-white flex items-center gap-1.5">
                        {branch.name}
                      </h3>
                      {branch.isMain && (
                        <span className="bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300 text-[10px] font-black px-2 py-0.5 rounded-full border border-amber-300/40">
                          Main HQ Branch
                        </span>
                      )}
                      <span className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {branch.county} County
                      </span>
                    </div>

                    <p className="text-xs text-gray-600 dark:text-gray-300 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span>{branch.address}</span>
                    </p>

                    <p className="text-[11px] text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-gray-400 shrink-0" />
                      <span>{branch.phone}</span>
                    </p>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelect(branch);
                    }}
                    className={`shrink-0 px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-plum text-white shadow-xs'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-plum hover:text-white'
                    }`}
                  >
                    {isSelected ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Selected</span>
                      </>
                    ) : (
                      <>
                        <span>Shop Here</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="bg-gray-50 dark:bg-gray-950 px-6 py-3 border-t border-gray-150 dark:border-gray-800 text-[11px] text-gray-500 dark:text-gray-400 flex items-center justify-between">
          <span className="flex items-center gap-1 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-green" />
            <span>K-Matt Multi-Branch Sync Active</span>
          </span>
          <span className="font-bold text-gray-700 dark:text-gray-300">6 Regional Branches Operating</span>
        </div>
      </div>
    </div>
  );
}
