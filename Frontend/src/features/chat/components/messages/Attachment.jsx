import { FileText, X } from 'lucide-react';
import { getAttachmentUrl } from '../../service/chat.api';

const formatSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

// One attached file. Images show a thumbnail, other files show an icon and the name.
// Clicking it opens the file in a new tab. Pass onRemove to show a small "x" button (used in the input box).
const Attachment = ({ attachment, onRemove }) => {
  const url = getAttachmentUrl(attachment.id);

  return (
    <div className="relative">
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        title={`Open ${attachment.name}`}
        className="flex items-center overflow-hidden rounded-lg border border-[#2b374b] bg-[#151922] transition-colors hover:border-[#4b5d7e] hover:bg-[#1b2230]"
      >
        {attachment.kind === 'image' ? (
          <img src={url} alt={attachment.name} className="h-16 w-16 object-cover" />
        ) : (
          <div className="flex max-w-[200px] items-center gap-2 px-3 py-2">
            <FileText className="h-4 w-4 shrink-0 text-[#8ba0fa]" />
            <div className="min-w-0">
              <p className="truncate text-[12px] font-medium text-[#c8d4e4]">{attachment.name}</p>
              <p className="text-[11px] text-[#7c8ca3]">{formatSize(attachment.size)}</p>
            </div>
          </div>
        )}
      </a>

      {onRemove && (
        <button
          type="button"
          onClick={() => onRemove(attachment.id)}
          title="Remove"
          className="absolute -right-1.5 -top-1.5 flex h-5 w-5 cursor-pointer items-center justify-center rounded-full bg-[#2b374b] text-[#e2e8f0] hover:bg-[#4b5d7e]"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </div>
  );
};

export default Attachment;