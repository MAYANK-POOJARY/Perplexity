import React, { useEffect, useRef } from 'react';
import UserMessage from './UserMessage';
import AssistantMessage from './AssistantMessage';
import { Sparkles } from 'lucide-react';

const MessageList = ({ messages = [], isThinking = false }) => {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto px-4 md:px-6 pb-28">
      {messages.map((msg) => {
        if (msg.role === 'user') {
          return <UserMessage key={msg.id} content={msg.content} />;
        }
        return <AssistantMessage key={msg.id} message={msg} />;
      })}

      {/* Thinking state indicator */}
      {isThinking && (
        <div className="flex items-start gap-3.5 w-full my-4 animate-pulse">
          <div className="w-8 h-8 rounded-full bg-[#1b2230] border border-[#2b374b] flex items-center justify-center shrink-0 mt-0.5">
            <Sparkles className="w-4 h-4 text-[#8ba0fa] animate-spin" />
          </div>
          <div className="flex items-center gap-1.5 pt-2">
            <span className="w-2 h-2 rounded-full bg-[#8ba0fa]/60 animate-bounce" />
            <span className="w-2 h-2 rounded-full bg-[#8ba0fa]/60 animate-bounce [animation-delay:0.2s]" />
            <span className="w-2 h-2 rounded-full bg-[#8ba0fa]/60 animate-bounce [animation-delay:0.4s]" />
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
};

export default MessageList;
