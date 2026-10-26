import React from 'react';
import ThreadItem from './ThreadItem';

const ThreadGroup = ({ group, activeThreadId, onSelectThread, onDeleteThread }) => {
  if (!group.items || group.items.length === 0) return null;

  return (
    <div className="flex flex-col mb-4">
      {/* Category Heading */}
      <h3 className="text-[11px] font-semibold tracking-wider text-zinc-400 dark:text-zinc-500 uppercase px-3 mb-1.5 select-none font-mono">
        {group.category}
      </h3>

      {/* Items list */}
      <div className="flex flex-col gap-0.5">
        {group.items.map((item) => (
          <ThreadItem
            key={item.id}
            item={item}
            isActive={item.id === activeThreadId}
            onClick={() => onSelectThread(item.id)}
            onDelete={onDeleteThread ? () => onDeleteThread(item.id) : undefined}
          />
        ))}
      </div>
    </div>
  );
};

export default ThreadGroup;
