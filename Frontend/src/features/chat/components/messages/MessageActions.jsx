import { useState } from 'react';
import { Copy, Check, RefreshCw } from 'lucide-react';

const buttonClass =
  'flex items-center gap-1.5 rounded-md px-2 py-1 text-[12px] text-[#7c8ca3] transition-colors hover:bg-[#1b2230] hover:text-[#e2e8f0] cursor-pointer';

const MessageActions = ({ content, onRegenerate }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);   // back to "Copy" after 2 seconds
    } catch (error) {
      console.error('Copy failed', error);
    }
  };

  return (
    <div className="mt-2 flex items-center gap-1">
      <button type="button" onClick={handleCopy} className={buttonClass} title="Copy answer">
        {copied ? <Check className="h-3.5 w-3.5 text-[#86efac]" /> : <Copy className="h-3.5 w-3.5" />}
        <span>{copied ? 'Copied' : 'Copy'}</span>
      </button>

      {onRegenerate && (
        <button type="button" onClick={onRegenerate} className={buttonClass} title="Generate a new answer">
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Regenerate</span>
        </button>
      )}
    </div>
  );
};

export default MessageActions;