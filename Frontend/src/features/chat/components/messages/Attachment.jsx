import React from 'react';
import { FileText, X } from 'lucide-react';
import { getAttachmentUrl } from '../../service/chat.api';

const formatSize = (bytes) => {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const Attachment = ({ attachment, onRemove }) => {
  const url = getAttachmentUrl(attachment.id);

  return (
    <div className="relative group/att inline-block">
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        title={`Open ${attachment.name}`}
        className="flex items-center overflow-hidden rounded-xl border border-zinc-200/90 dark:border-zinc-800/80 bg-zinc-100/90 hover:bg-zinc-200/70 dark:bg-zinc-800/80 dark:hover:bg-zinc-700/80 transition-all duration-150 shadow-xs"
      >
        {attachment.kind === 'image' ? (
          <img src={url} alt={attachment.name} className="h-14 w-14 object-cover" />
        ) : (
          <div className="flex max-w-[200px] items-center gap-2 px-3 py-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-500/10 dark:bg-indigo-400/15 flex items-center justify-center shrink-0">
              <FileText className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-[12px] font-medium text-zinc-800 dark:text-zinc-200">{attachment.name}</p>
              <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono">{formatSize(attachment.size)}</p>
            </div>
          </div>
        )}
      </a>

      {onRemove && (
        <button
          type="button"
          onClick={() => onRemove(attachment.id)}
          title="Remove file"
          className="absolute -right-1.5 -top-1.5 flex h-5 w-5 cursor-pointer items-center justify-center rounded-full bg-zinc-700 text-white dark:bg-zinc-700 dark:text-zinc-200 hover:bg-red-500 shadow-sm transition-colors"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </div>
  );
};

export default Attachment;