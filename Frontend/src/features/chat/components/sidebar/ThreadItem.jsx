import React from 'react';
import { MessageSquare, Trash2 } from 'lucide-react';

const ThreadItem = ({ item, isActive, onClick, onDelete }) => {
  return (
    <div
      className={`group w-full flex items-center gap-1 rounded-lg text-[13px] transition-all duration-150 ${
        isActive
          ? 'bg-[#1b212c] text-white font-medium border border-[#2c3749]/60 shadow-sm'
          : 'text-[#8492a6] hover:text-[#e2e8f0] hover:bg-[#151922] font-normal'
      }`}
    >
      <button onClick={onClick} className="min-w-0 flex-1 flex items-center gap-2.5 px-3 py-2 text-left cursor-pointer">
        <MessageSquare
          className={`w-4 h-4 shrink-0 ${
            isActive ? 'text-[#a5b4fc]' : 'text-[#627185]'
          }`}
        />
        <span className="truncate">{item.title.replace(/["'*]/g, '')}</span>
      </button>
      {onDelete && (
        <button
          type="button"
          onClick={onDelete}
          aria-label={`Delete ${item.title}`}
          title="Delete chat"
          className="mr-2 p-1 rounded text-[#627185] hover:text-red-400 opacity-0 group-hover:opacity-100 focus:opacity-100"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};

export default ThreadItem;
