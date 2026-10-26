import React from 'react';
import { MessageSquare, Trash2 } from 'lucide-react';

const ThreadItem = ({ item, isActive, onClick, onDelete }) => {
  const cleanTitle = (item.title || 'Untitled conversation').replace(/["'*]/g, '');

  return (
    <div
      className={`group relative w-full flex items-center justify-between rounded-lg text-[13px] transition-all duration-150 ${
        isActive
          ? 'bg-indigo-50/90 text-indigo-950 font-medium dark:bg-zinc-800/90 dark:text-white border border-indigo-200/80 dark:border-zinc-700/60 shadow-xs'
          : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/80 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-zinc-800/50 border border-transparent'
      }`}
    >
      <button
        onClick={onClick}
        className="min-w-0 flex-1 flex items-center gap-2.5 px-3 py-2 text-left cursor-pointer"
        title={cleanTitle}
      >
        <span
          className={`w-1.5 h-1.5 rounded-full shrink-0 transition-colors ${
            isActive ? 'bg-indigo-600 dark:bg-indigo-400' : 'bg-transparent group-hover:bg-zinc-400 dark:group-hover:bg-zinc-600'
          }`}
        />
        <MessageSquare
          className={`w-3.5 h-3.5 shrink-0 transition-colors ${
            isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-zinc-400 dark:text-zinc-500'
          }`}
        />
        <span className="truncate">{cleanTitle}</span>
      </button>

      {onDelete && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          aria-label={`Delete ${cleanTitle}`}
          title="Delete thread"
          className="mr-1.5 p-1 rounded-md text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all duration-150 cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};

export default ThreadItem;
