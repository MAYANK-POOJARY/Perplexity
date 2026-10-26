import { useEffect, useRef } from 'react';
import UserMessage from './UserMessage';
import AssistantMessage from './AssistantMessage';
import { Sparkles } from 'lucide-react';
import PerplexityLogo from '../header/PerplexityLogo';

const MessageList = ({ messages = [], isThinking = false, onRegenerate }) => {
  const bottomRef = useRef(null);

  const isStreaming = messages[messages.length - 1]?.isStreaming;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: isStreaming ? 'auto' : 'smooth' });
  }, [messages, isThinking, isStreaming]);

  return (
    <div className="flex flex-col w-full max-w-3xl lg:max-w-4xl mx-auto px-4 sm:px-6 md:px-8 pb-36 pt-2">
      {messages.map((msg, index) => {
        if (msg.isReplaced) return null;
        if (msg.role === 'user') {
          return <UserMessage key={msg.id} content={msg.content} attachments={msg.attachments} />;
        }
        if (msg.isStreaming && !msg.content && !msg.sources?.length) return null;
        return (
          <AssistantMessage
            key={msg.id}
            message={msg}
            isLast={index === messages.length - 1}
            onRegenerate={onRegenerate}
          />
        );
      })}

      {/* Thinking state indicator */}
      {isThinking && (
        <div className="flex items-start gap-3.5 w-full my-6 animate-fade-in select-none">
          <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shrink-0 mt-1 shadow-sm">
            <PerplexityLogo className="w-4 h-4" isIconOnly />
          </div>
          <div className="flex flex-col gap-1.5 pt-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400">
                Perplexity is synthesizing...
              </span>
            </div>
            <div className="flex items-center gap-1.5 pt-1">
              <span className="w-2 h-2 rounded-full bg-indigo-500/70 animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-indigo-500/70 animate-bounce [animation-delay:0.18s]" />
              <span className="w-2 h-2 rounded-full bg-indigo-500/70 animate-bounce [animation-delay:0.36s]" />
            </div>
          </div>
        </div>
      )}

      <div ref={bottomRef} className="h-4" />
    </div>
  );
};

export default MessageList;
