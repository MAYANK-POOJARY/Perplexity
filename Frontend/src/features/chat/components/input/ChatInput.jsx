import { useRef, useState } from 'react';
import { Plus, Scan, ArrowUp, Square, Loader2 } from 'lucide-react';
import Attachment from '../messages/Attachment';
import { uploadAttachments } from '../../service/chat.api';

const MAX_FILES = 3;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB, the same limit the server enforces
const ACCEPT = 'image/png,image/jpeg,image/webp,image/gif,application/pdf,.pdf,.txt,.md,.csv,.json,.js,.jsx,.ts,.tsx,.py,.java,.html,.css';

const ChatInput = ({ onSendMessage, onStop, disabled = false }) => {
  const [inputValue, setInputValue] = useState('');
  const [attachments, setAttachments] = useState([]);   // files already uploaded, waiting to be sent
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef(null);

  const canSend = inputValue.trim() && !disabled && !uploading;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSend) return;
    const sent = await onSendMessage(inputValue.trim(), attachments);
    if (sent !== false) {
      setInputValue('');
      setAttachments([]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // the user picked files: check them quickly here, then upload right away
  const handleFilesSelected = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';   // lets the user pick the same file again later
    if (files.length === 0) return;

    setUploadError('');

    if (attachments.length + files.length > MAX_FILES) {
      setUploadError(`You can attach at most ${MAX_FILES} files`);
      return;
    }
    const tooBig = files.find((file) => file.size > MAX_FILE_SIZE);
    if (tooBig) {
      setUploadError(`"${tooBig.name}" is larger than 10 MB`);
      return;
    }

    setUploading(true);
    try {
      const uploaded = await uploadAttachments(files);
      setAttachments((current) => [...current, ...uploaded]);
    } catch (error) {
      setUploadError(error.response?.data?.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const removeAttachment = (id) => {
    setAttachments((current) => current.filter((file) => file.id !== id));
  };

  return (
    <div className="fixed bottom-0 right-0 left-0 md:left-[260px] p-4 bg-gradient-to-t from-[#0f1115] via-[#0f1115]/95 to-transparent pointer-events-none z-20">
      <div className="max-w-3xl mx-auto pointer-events-auto">
        {/* Floating Input Container */}
        <form
          onSubmit={handleSubmit}
          className="relative flex flex-col bg-[#171b24] border border-[#273041] hover:border-[#35425a] focus-within:border-[#4b5d7e] rounded-2xl px-3.5 py-2.5 shadow-xl shadow-black/50 transition-all duration-150"
        >
          {/* Files waiting to be sent */}
          {(attachments.length > 0 || uploading || uploadError) && (
            <div className="flex flex-wrap items-center gap-2 pb-2.5">
              {attachments.map((attachment) => (
                <Attachment key={attachment.id} attachment={attachment} onRemove={removeAttachment} />
              ))}
              {uploading && (
                <span className="flex items-center gap-1.5 text-[12px] text-[#7c8ca3]">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Uploading...
                </span>
              )}
              {uploadError && <span className="text-[12px] text-red-400">{uploadError}</span>}
            </div>
          )}

          <div className="flex w-full items-center">
            {/* hidden file picker, opened by the + button */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={ACCEPT}
              onChange={handleFilesSelected}
              className="hidden"
            />

            {/* Plus / Add Action */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="p-1.5 rounded-lg text-[#7c8ca3] hover:text-white hover:bg-[#202736] transition-colors cursor-pointer shrink-0 disabled:opacity-50"
              title="Attach an image or text file"
            >
              <Plus className="w-5 h-5" />
            </button>

            {/* Text Input */}
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={attachments.length > 0 ? 'Ask something about your file...' : 'Ask Lumina anything...'}
              disabled={disabled}
              className="flex-1 bg-transparent px-3 py-1 text-[14px] text-[#e2e8f0] placeholder-[#576478] focus:outline-none disabled:opacity-50"
            />

            {/* Right Action Buttons */}
            <div className="flex items-center gap-1.5 shrink-0">
              {/* Vision / Scan Button */}
              <button
                type="button"
                className="p-1.5 rounded-lg text-[#7c8ca3] hover:text-white hover:bg-[#202736] transition-colors cursor-pointer"
                title="Visual analysis / Web scan"
              >
                <Scan className="w-4 h-4" />
              </button>

              {/* While an answer is being written show Stop, otherwise show Send */}
              {disabled && onStop ? (
                <button
                  type="button"
                  onClick={onStop}
                  className="w-8 h-8 rounded-full flex items-center justify-center bg-[#94a3f8] hover:bg-[#a6b4ff] text-[#0f1115] transition-all duration-150 cursor-pointer"
                  title="Stop generating"
                >
                  <Square className="w-3.5 h-3.5 fill-current" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!canSend}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-150 cursor-pointer ${
                    canSend
                      ? 'bg-[#94a3f8] hover:bg-[#a6b4ff] text-[#0f1115] shadow-md shadow-indigo-500/20'
                      : 'bg-[#94a3f8] text-[#0f1115] hover:opacity-90'
                  }`}
                  title="Send prompt"
                >
                  <ArrowUp className="w-4 h-4 stroke-[2.5]" />
                </button>
              )}
            </div>
          </div>
        </form>

        {/* Disclaimer Text */}
        <p className="text-[11px] text-[#556377] text-center mt-2 tracking-tight select-none">
          Lumina Intelligence may produce inaccurate information about people, places, or facts.
        </p>
      </div>
    </div>
  );
};

export default ChatInput;