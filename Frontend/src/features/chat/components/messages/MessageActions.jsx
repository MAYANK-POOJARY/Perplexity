import React, { useState } from 'react';
import { Copy, Check, RefreshCw } from 'lucide-react';

const buttonClass =
  'flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[12px] text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800/70 transition-all duration-150 cursor-pointer select-none';

const MessageActions = ({ content, onRegenerate }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Copy failed', error);
    }
  };

  return (
    <div className="mt-3 pt-2 flex items-center gap-1 border-t border-zinc-100 dark:border-zinc-800/40 select-none">
      <button type="button" onClick={handleCopy} className={buttonClass} title="Copy response to clipboard">
        {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
        <span className={copied ? 'text-emerald-600 dark:text-emerald-400 font-medium' : ''}>
          {copied ? 'Copied' : 'Copy'}
        </span>
      </button>

      {onRegenerate && (
        <button type="button" onClick={onRegenerate} className={buttonClass} title="Regenerate answer">
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Regenerate</span>
        </button>
      )}
    </div>
  );
};

export default MessageActions;