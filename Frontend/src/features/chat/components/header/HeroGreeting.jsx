import React from 'react';
import { Sparkles } from 'lucide-react';

const HeroGreeting = () => {
  return (
    <div className="flex flex-col items-center justify-center pt-8 pb-6 px-4 text-center select-none">
      {/* Glow / Sparkle Icon Box */}
      <div className="w-12 h-12 rounded-2xl bg-[#171c25] border border-[#262f3e] flex items-center justify-center mb-5 shadow-lg shadow-black/40">
        <Sparkles className="w-6 h-6 text-white" />
      </div>

      {/* Brand Title */}
      <h1 className="text-3xl md:text-[34px] font-bold tracking-tight text-white flex items-center gap-2 mb-2">
        <span>Lumina</span>
        <span className="text-[#889cf8]">Intelligence</span>
      </h1>

      {/* Subtitle */}
      <p className="text-[14px] md:text-[14.5px] text-[#7d8b9e] max-w-md leading-relaxed">
        Advanced reasoning environment. Ask a complex question or provide data for analysis.
      </p>
    </div>
  );
};

export default HeroGreeting;
