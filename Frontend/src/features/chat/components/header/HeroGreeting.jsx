import React from 'react';
import { Compass, Cpu, Search, Sparkles, BookOpen } from 'lucide-react';
import PerplexityLogo from './PerplexityLogo';

const STARTER_PROMPTS = [
  {
    icon: Search,
    title: 'Research & Synthesize',
    prompt: 'Synthesize the latest developments and breakthroughs in quantum computing architecture.',
  },
  {
    icon: Cpu,
    title: 'System Design',
    prompt: 'Compare Raft and Paxos consensus algorithms for high-throughput distributed databases.',
  },
  {
    icon: Compass,
    title: 'Explain Complex Concept',
    prompt: 'Explain causal inference versus correlation with an intuitive real-world example.',
  },
  {
    icon: BookOpen,
    title: 'Code Analysis',
    prompt: 'What are the top performance pitfalls in React 19 and how do you prevent re-render cascades?',
  },
];

const HeroGreeting = ({ onSelectPrompt }) => {
  return (
    <div className="flex flex-col items-center justify-center pt-14 pb-8 px-4 text-center select-none animate-fade-in max-w-2xl mx-auto">
      {/* Brand Icon Badge */}
      <div className="relative mb-5 group">
        <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-indigo-500/30 to-violet-500/30 blur-lg opacity-70 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="relative w-14 h-14 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center shadow-lg shadow-indigo-500/10">
          <PerplexityLogo className="w-8 h-8" isIconOnly />
        </div>
      </div>

      {/* Brand Title */}
      <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-zinc-900 dark:text-white mb-2.5 font-sans">
        Where knowledge begins.
      </h1>

      {/* Subtitle */}
      <p className="text-[14.5px] text-zinc-500 dark:text-zinc-400 max-w-md leading-relaxed mb-8">
        Ask complex questions, synthesize research across documents, or reason through challenging problems.
      </p>

      {/* Interactive Starter Prompt Chips */}
      {onSelectPrompt && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full text-left">
          {STARTER_PROMPTS.map((item, idx) => {
            const Icon = item.icon;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => onSelectPrompt(item.prompt)}
                className="group flex flex-col p-3.5 rounded-xl bg-white/70 hover:bg-white dark:bg-zinc-900/60 dark:hover:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-800/80 hover:border-indigo-400/50 dark:hover:border-indigo-500/50 shadow-xs hover:shadow-md transition-all duration-150 cursor-pointer"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Icon className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                  <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 tracking-tight">
                    {item.title}
                  </span>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                  {item.prompt}
                </p>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default HeroGreeting;
