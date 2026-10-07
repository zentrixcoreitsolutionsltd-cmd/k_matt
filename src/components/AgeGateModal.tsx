import React from 'react';
import { AlertTriangle, ShieldCheck } from 'lucide-react';

interface AgeGateModalProps {
  isOpen: boolean;
  onConfirm: (is18Plus: boolean) => void;
}

export default function AgeGateModal({ isOpen, onConfirm }: AgeGateModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white border border-gray-150 rounded-3xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl animate-scale-up">
        <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <div>
          <h3 className="font-black text-lg text-gray-900">Age Verification Required</h3>
          <p className="text-xs text-gray-600 mt-1">
            You are viewing alcoholic beverages in the Liquor Cellar category. You must be 18 years or older to purchase alcohol according to Kenyan Law.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <button 
            onClick={() => onConfirm(false)}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs py-3 rounded-xl transition-colors cursor-pointer"
          >
            I am under 18
          </button>
          <button 
            onClick={() => onConfirm(true)}
            className="w-full bg-plum hover:bg-plum-dark text-white font-extrabold text-xs py-3 rounded-xl transition-colors cursor-pointer"
          >
            I am 18 or older
          </button>
        </div>
      </div>
    </div>
  );
}
