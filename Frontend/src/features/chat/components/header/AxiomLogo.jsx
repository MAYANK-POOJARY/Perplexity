import React from 'react';

const AxiomLogo = ({ className = 'w-7 h-7 rounded-xl', isIconOnly = false }) => {
  return (
    <div className="flex items-center gap-2.5 select-none">
      {/* Logo image — sourced from /public/axiom-logo.jpg */}
      <img
        src="/axiom-logo.jpg"
        alt="Axiom logo"
        className={`object-cover shrink-0 ${className}`}
      />

      {!isIconOnly && (
        <div className="flex items-center gap-1.5 leading-none">
          <span className="font-semibold text-[15px] tracking-tight text-zinc-900 dark:text-white">
            Axiom
          </span>
          <span className="text-[10px] uppercase font-mono font-semibold px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:bg-indigo-400/15 dark:text-indigo-300 border border-indigo-500/20">
            AI
          </span>
        </div>
      )}
    </div>
  );
};

export default AxiomLogo;

