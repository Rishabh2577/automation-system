
import React from 'react';

interface LoadingScreenProps {
  message: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ message }) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-6 text-center space-y-12">
      <div className="relative w-64 h-64">
        {/* Animated Orbits */}
        <div className="absolute inset-0 border border-white/10 rounded-full animate-[spin_10s_linear_infinite]" />
        <div className="absolute inset-8 border border-white/20 rounded-full animate-[spin_7s_linear_infinite_reverse]" />
        <div className="absolute inset-16 border border-white/30 rounded-full animate-[spin_5s_linear_infinite]" />
        
        {/* Central Glowing Core */}
        <div className="absolute inset-[88px] bg-white rounded-full blur-xl animate-pulse" />
        <div className="absolute inset-[96px] bg-white rounded-full shadow-[0_0_50px_rgba(255,255,255,0.5)]" />
      </div>

      <div className="space-y-4 max-w-md">
        <h2 className="text-2xl font-bold tracking-tight text-white animate-pulse">
          Crafting Cinematic Experience
        </h2>
        <p className="text-gray-400 font-mono text-sm tracking-widest uppercase">
          {message}
        </p>
      </div>

      <div className="w-full max-w-xs bg-white/5 h-1 rounded-full overflow-hidden">
        <div className="h-full bg-white animate-[shimmer_2s_infinite] origin-left" style={{ width: '60%' }} />
      </div>
      
      <p className="text-xs text-gray-600 max-w-xs">
        Note: Veo generation can take 2-3 minutes. Please keep this tab open.
      </p>
    </div>
  );
};

export default LoadingScreen;
