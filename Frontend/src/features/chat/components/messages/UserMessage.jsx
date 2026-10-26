import React, { memo } from 'react';
import { useSelector } from 'react-redux';
import Attachment from './Attachment';

const UserMessage = ({ content, attachments = [] }) => {
  const user = useSelector((state) => state.auth.user);

  const initials = user?.username
    ? user.username.slice(0, 2).toUpperCase()
    : 'AX';

  return (
    <div className="flex justify-end w-full my-4 animate-fade-in">
      <div className="flex items-start gap-3 max-w-[88%] md:max-w-xl">
        {/* Message Bubble & Attachments (Right-aligned) */}
        <div className="flex flex-col items-end gap-2 min-w-0">
          {attachments.length > 0 && (
            <div className="flex flex-wrap justify-end gap-2">
              {attachments.map((attachment) => (
                <Attachment key={attachment.id} attachment={attachment} />
              ))}
            </div>
          )}

          <div className="bg-zinc-100 text-zinc-900 dark:bg-zinc-800/90 dark:text-zinc-100 text-[14px] md:text-[14.5px] leading-relaxed px-5 py-3.5 rounded-2xl rounded-tr-sm border border-zinc-200/90 dark:border-zinc-700/60 shadow-xs">
            {content}
          </div>
        </div>

        {/* Circular User Avatar on the Right Side of the Message */}
        <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white text-[11px] font-semibold shadow-sm shrink-0 mt-1 select-none">
          {initials}
        </div>
      </div>
    </div>
  );
};

export default memo(UserMessage);