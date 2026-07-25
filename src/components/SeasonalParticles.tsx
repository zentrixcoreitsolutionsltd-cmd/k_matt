import React from 'react';

export default function SeasonalParticles() {
  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      <div className="absolute top-2 left-10 w-2 h-2 bg-white/40 rounded-full animate-ping" />
      <div className="absolute top-8 right-20 w-3 h-3 bg-plum/30 rounded-full animate-pulse" />
    </div>
  );
}
