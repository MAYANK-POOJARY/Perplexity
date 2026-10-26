import React from 'react';
import { Plus } from 'lucide-react';

const NewThreadButton = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-white hover:bg-zinc-50 text-zinc-900 dark:bg-zinc-800/80 dark:hover:bg-zinc-700/80 dark:text-zinc-100 border border-[var(--color-border)] transition-all duration-150 text-[13.5px] font-medium group cursor-pointer shadow-sm hover:shadow active:scale-[0.985]"
      title="Start a new conversation (⌘K)"
    >
      <div className="flex items-center gap-2.5">
        <Plus className="w-4 h-4 text-indigo-400 dark:text-indigo-300 group-hover:rotate-90 transition-transform duration-200" />
        <span>New Thread</span>
      </div>
    </button>
  );
};

export default NewThreadButton;
