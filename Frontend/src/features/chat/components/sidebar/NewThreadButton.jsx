import React from 'react';
import { Plus } from 'lucide-react';

const NewThreadButton = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg bg-[#181d26] hover:bg-[#1f2533] border border-[#262f3e] text-[#d1d5db] hover:text-white transition-all duration-150 text-[13.5px] font-medium group cursor-pointer shadow-sm"
    >
      <Plus className="w-4 h-4 text-[#8b9bb4] group-hover:text-white transition-colors" />
      <span>New Thread</span>
    </button>
  );
};

export default NewThreadButton;
