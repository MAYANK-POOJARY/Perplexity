import React from 'react';

const UserMessage = ({ content }) => {
  return (
    <div className="flex justify-end w-full my-3">
      <div className="max-w-[85%] md:max-w-xl bg-[#202530] text-[#e1e7f0] text-[13.5px] md:text-[14px] leading-relaxed px-5 py-3.5 rounded-2xl border border-[#2c3547]/70 shadow-sm">
        {content}
      </div>
    </div>
  );
};

export default UserMessage;
