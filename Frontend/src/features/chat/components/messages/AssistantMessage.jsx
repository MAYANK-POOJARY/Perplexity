import React, { useState, memo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Sparkles, Copy, Check, ChevronDown, ChevronRight, Terminal } from 'lucide-react';
import SourceList from './SourceList';
import MessageActions from './MessageActions';
import AxiomLogo from '../header/AxiomLogo';

// Custom Pre/Code component with Copy Code button
const PreBlock = ({ children, ...props }) => {
  const [copied, setCopied] = useState(false);

  // Extract raw text from children for copying
  const extractText = (node) => {
    if (typeof node === 'string') return node;
    if (Array.isArray(node)) return node.map(extractText).join('');
    if (node?.props?.children) return extractText(node.props.children);
    return '';
  };

  const codeText = extractText(children);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(codeText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Failed to copy code', e);
    }
  };

  // Determine language if present on code child
  const codeChild = React.Children.toArray(children)[0];
  const className = codeChild?.props?.className || '';
  const langMatch = /language-(\w+)/.exec(className);
  const language = langMatch ? langMatch[1] : 'code';

  return (
    <div className="my-4 rounded-xl overflow-hidden border border-zinc-200/90 dark:border-zinc-800/80 bg-[#0d1017] shadow-sm select-text">
      {/* Code Header Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-zinc-900/90 border-b border-zinc-800/80 select-none">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-indigo-400" />
          <span className="text-[11.5px] font-mono text-zinc-400 uppercase tracking-wider font-semibold">
            {language}
          </span>
        </div>
        <button
          type="button"
          onClick={handleCopyCode}
          className="flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-mono text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-emerald-400" />
              <span className="text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span>Copy code</span>
            </>
          )}
        </button>
      </div>

      {/* Code Content */}
      <pre className="p-4 overflow-x-auto text-[13px] font-mono text-zinc-200 leading-relaxed scrollbar-none" {...props}>
        {children}
      </pre>
    </div>
  );
};

const AssistantMessage = ({ message, isLast = false, onRegenerate }) => {
  const { content, sources, thinking } = message;
  const [showThinking, setShowThinking] = useState(false);

  return (
    <div className="flex items-start gap-3.5 w-full my-6 animate-fade-in">
      {/* Axiom Brand Badge Avatar (Circular) */}
      <div className="shrink-0 mt-1 select-none">
        <AxiomLogo className="w-7 h-7 rounded-full" isIconOnly />
      </div>

      {/* Content Stream */}
      <div className="flex-1 min-w-0 text-zinc-800 dark:text-zinc-200 text-[14px] md:text-[14.5px] leading-relaxed">
        {/* Model & Status Header */}
        <div className="flex items-center gap-2 mb-2 select-none">
          <span className="font-semibold text-xs text-zinc-900 dark:text-zinc-100 tracking-tight">
            Axiom
          </span>
          {sources?.length > 0 && (
            <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/15 dark:text-emerald-300 border border-emerald-500/20">
              Verified Synthesis
            </span>
          )}
        </div>

        {/* Sources Bar */}
        <SourceList sources={sources} />

        {/* Optional Reasoning trace accordion */}
        {thinking && (
          <div className="mb-3 rounded-lg border border-zinc-200 dark:border-zinc-800/80 bg-zinc-50 dark:bg-zinc-900/40 overflow-hidden">
            <button
              onClick={() => setShowThinking(!showThinking)}
              className="w-full flex items-center justify-between px-3 py-1.5 text-xs text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 cursor-pointer select-none"
            >
              <span className="flex items-center gap-1.5 font-mono text-[11px]">
                <Sparkles className="w-3 h-3 text-indigo-500" />
                Thinking trace
              </span>
              {showThinking ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>
            {showThinking && (
              <div className="px-3.5 py-2.5 text-xs text-zinc-600 dark:text-zinc-400 border-t border-zinc-200 dark:border-zinc-800 font-mono leading-relaxed whitespace-pre-wrap">
                {thinking}
              </div>
            )}
          </div>
        )}

        {/* Markdown Content */}
        <div className="space-y-3.5 text-zinc-800 dark:text-zinc-200 [&_p]:leading-relaxed [&_h1]:mt-6 [&_h1]:text-xl [&_h1]:font-semibold [&_h1]:text-zinc-900 dark:[&_h1]:text-white [&_h2]:mt-5 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-zinc-900 dark:[&_h2]:text-white [&_h3]:mt-4 [&_h3]:font-semibold [&_h3]:text-zinc-900 dark:[&_h3]:text-white [&_strong]:font-semibold [&_strong]:text-zinc-900 dark:[&_strong]:text-white [&_em]:italic [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:space-y-1.5 [&_ol]:pl-6 [&_li]:pl-1 [&_a]:text-indigo-600 dark:[&_a]:text-indigo-400 [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:text-indigo-500 [&_blockquote]:border-l-2 [&_blockquote]:border-indigo-500/50 [&_blockquote]:pl-4 [&_blockquote]:text-zinc-600 dark:[&_blockquote]:text-zinc-400 [&_blockquote]:italic [&_hr]:border-zinc-200 dark:[&_hr]:border-zinc-800 [&_table]:block [&_table]:max-w-full [&_table]:overflow-x-auto [&_th]:border [&_th]:border-zinc-300 dark:[&_th]:border-zinc-700 [&_th]:bg-zinc-100 dark:[&_th]:bg-zinc-800 [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:font-semibold [&_td]:border [&_td]:border-zinc-200 dark:[&_td]:border-zinc-800 [&_td]:px-3 [&_td]:py-2 [&_:not(pre)>code]:rounded-md [&_:not(pre)>code]:bg-zinc-100 dark:[&_:not(pre)>code]:bg-zinc-800/80 [&_:not(pre)>code]:border [&_:not(pre)>code]:border-zinc-200 dark:[&_:not(pre)>code]:border-zinc-700/60 [&_:not(pre)>code]:px-1.5 [&_:not(pre)>code]:py-0.5 [&_:not(pre)>code]:font-mono [&_:not(pre)>code]:text-[0.875em] [&_:not(pre)>code]:text-indigo-600 dark:[&_:not(pre)>code]:text-indigo-300">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              a: (props) => <a {...props} target="_blank" rel="noreferrer" />,
              pre: PreBlock,
            }}
          >
            {content || ''}
          </ReactMarkdown>

          {/* Blinking streaming cursor */}
          {message.isStreaming && (
            <span className="inline-block h-4 w-1.5 rounded-sm bg-indigo-500 animate-pulse ml-0.5 align-middle" />
          )}
        </div>

        {/* Copy / Regenerate / Share actions once response has arrived */}
        {!message.isStreaming && content && (
          <MessageActions
            content={content}
            onRegenerate={isLast ? onRegenerate : undefined}
          />
        )}
      </div>
    </div>
  );
};

export default memo(AssistantMessage);
