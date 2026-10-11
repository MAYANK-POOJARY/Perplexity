import React, { useState } from 'react';
import { Plus, Scan, ArrowUp } from 'lucide-react';

const ChatInput = ({ onSendMessage, disabled = false }) => {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || disabled) return;
    const sent = await onSendMessage(inputValue.trim());
    if (sent !== false) {
      setInputValue('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="fixed bottom-0 right-0 left-0 md:left-[260px] p-4 bg-gradient-to-t from-[#0f1115] via-[#0f1115]/95 to-transparent pointer-events-none z-20">
      <div className="max-w-3xl mx-auto pointer-events-auto">
        {/* Floating Input Container */}
        <form
          onSubmit={handleSubmit}
          className="relative flex items-center bg-[#171b24] border border-[#273041] hover:border-[#35425a] focus-within:border-[#4b5d7e] rounded-2xl px-3.5 py-2.5 shadow-xl shadow-black/50 transition-all duration-150"
        >
          {/* Plus / Add Action */}
          <button
            type="button"
            className="p-1.5 rounded-lg text-[#7c8ca3] hover:text-white hover:bg-[#202736] transition-colors cursor-pointer shrink-0"
            title="Attach file or context"
          >
            <Plus className="w-5 h-5" />
          </button>

          {/* Text Input */}
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Lumina anything..."
            disabled={disabled}
            className="flex-1 bg-transparent px-3 py-1 text-[14px] text-[#e2e8f0] placeholder-[#576478] focus:outline-none disabled:opacity-50"
          />

          {/* Right Action Buttons */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Vision / Scan Button */}
            <button
              type="button"
              className="p-1.5 rounded-lg text-[#7c8ca3] hover:text-white hover:bg-[#202736] transition-colors cursor-pointer"
              title="Visual analysis / Web scan"
            >
              <Scan className="w-4 h-4" />
            </button>

            {/* Circular Send Button */}
            <button
              type="submit"
              disabled={!inputValue.trim() || disabled}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-150 cursor-pointer ${
                inputValue.trim() && !disabled
                  ? 'bg-[#94a3f8] hover:bg-[#a6b4ff] text-[#0f1115] shadow-md shadow-indigo-500/20'
                  : 'bg-[#94a3f8] text-[#0f1115] hover:opacity-90'
              }`}
              title="Send prompt"
            >
              <ArrowUp className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </form>

        {/* Disclaimer Text */}
        <p className="text-[11px] text-[#556377] text-center mt-2 tracking-tight select-none">
          Lumina Intelligence may produce inaccurate information about people, places, or facts.
        </p>
      </div>
    </div>
  );
};

export default ChatInput;
