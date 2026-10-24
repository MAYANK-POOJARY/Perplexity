import Attachment from './Attachment';
import { memo } from 'react';

const UserMessage = ({ content, attachments = [] }) => {
  return (
    <div className="flex justify-end w-full my-3">
      <div className="flex max-w-[85%] md:max-w-xl flex-col items-end gap-2">
        {attachments.length > 0 && (
          <div className="flex flex-wrap justify-end gap-2">
            {attachments.map((attachment) => (
              <Attachment key={attachment.id} attachment={attachment} />
            ))}
          </div>
        )}

        <div className="bg-[#202530] text-[#e1e7f0] text-[13.5px] md:text-[14px] leading-relaxed px-5 py-3.5 rounded-2xl border border-[#2c3547]/70 shadow-sm">
          {content}
        </div>
      </div>
    </div>
  );
};

export default memo(UserMessage);