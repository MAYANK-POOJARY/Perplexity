import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Sparkles } from 'lucide-react';
import SourceList from './SourceList';
import MessageActions from './MessageActions';

const AssistantMessage = ({ message, isLast = false, onRegenerate }) => {
  const { content, sources } = message;

  return (
    <div className="flex items-start gap-3.5 w-full my-4">
      {/* Sparkle Avatar Badge */}
      <div className="w-8 h-8 rounded-full bg-[#1b2230] border border-[#2b374b] flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
        <Sparkles className="w-4 h-4 text-[#8ba0fa]" />
      </div>

      {/* Content Stream */}
      <div className="flex-1 min-w-0 text-[#c8d4e4] text-[13.5px] md:text-[14px] leading-relaxed">
        <SourceList sources={sources} />
        <div className="space-y-3 [&_p]:leading-relaxed [&_h1]:mt-5 [&_h1]:text-xl [&_h1]:font-semibold [&_h1]:text-white [&_h2]:mt-4 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-white [&_h3]:mt-3 [&_h3]:font-semibold [&_h3]:text-white [&_strong]:font-semibold [&_strong]:text-white [&_em]:italic [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:space-y-1 [&_ol]:pl-6 [&_li]:pl-1 [&_a]:text-[#a5b4fc] [&_a]:underline [&_a]:underline-offset-2 [&_blockquote]:border-l-2 [&_blockquote]:border-[#6474b8] [&_blockquote]:pl-4 [&_blockquote]:text-[#98a5b8] [&_hr]:border-[#2b374b] [&_table]:block [&_table]:max-w-full [&_table]:overflow-x-auto [&_th]:border [&_th]:border-[#35425a] [&_th]:bg-[#171c25] [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:text-white [&_td]:border [&_td]:border-[#2b374b] [&_td]:px-3 [&_td]:py-2 [&_code]:rounded [&_code]:bg-[#171c25] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.9em] [&_code]:text-[#c4b5fd] [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:border [&_pre]:border-[#2b374b] [&_pre]:bg-[#101318] [&_pre]:p-4 [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-[#c8d4e4]">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              a: (props) => <a {...props} target="_blank" rel="noreferrer" />,
            }}
          >
            {content || ''}
          </ReactMarkdown>
          {/* blinking cursor while the answer is still arriving */}
          {message.isStreaming && (
            <span className="inline-block h-4 w-1.5 rounded-sm bg-[#8ba0fa] animate-pulse" />
          )}
        </div>

          {/* Copy / Regenerate: only once the answer is finished */}
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

export default AssistantMessage;
