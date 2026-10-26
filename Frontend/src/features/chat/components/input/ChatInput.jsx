import { useRef, useState, useEffect } from 'react';
import { ArrowUp, Square, Loader2, Paperclip } from 'lucide-react';
import Attachment from '../messages/Attachment';
import { uploadAttachments, deleteAttachment } from '../../service/chat.api';

const MAX_FILES = 3;
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB
const ACCEPT = 'image/png,image/jpeg,image/webp,image/gif,application/pdf,.pdf,.txt,.md,.csv,.json,.js,.jsx,.ts,.tsx,.py,.java,.html,.css';

const ChatInput = ({ onSendMessage, onStop, disabled = false, initialPrompt = '', onPromptUsed }) => {
  const [inputValue, setInputValue] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  // Sync initialPrompt if provided (e.g. from HeroGreeting suggestion cards)
  useEffect(() => {
    if (initialPrompt) {
      setInputValue(initialPrompt);
      if (onPromptUsed) onPromptUsed();
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }
  }, [initialPrompt, onPromptUsed]);

  // Auto-resize textarea to expand downward and become scrollable when long
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const nextHeight = Math.min(Math.max(textareaRef.current.scrollHeight, 38), 160);
      textareaRef.current.style.height = `${nextHeight}px`;
    }
  }, [inputValue]);

  const canSend = inputValue.trim() && !disabled && !uploading;

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!canSend) return;
    const sent = await onSendMessage(inputValue.trim(), attachments);
    if (sent !== false) {
      setInputValue('');
      setAttachments([]);
      if (textareaRef.current) {
        textareaRef.current.style.height = '38px';
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleFilesSelected = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    if (files.length === 0) return;

    setUploadError('');

    if (attachments.length + files.length > MAX_FILES) {
      setUploadError(`You can attach at most ${MAX_FILES} files`);
      return;
    }
    const tooBig = files.find((file) => file.size > MAX_FILE_SIZE);
    if (tooBig) {
      setUploadError(`"${tooBig.name}" is larger than 20 MB`);
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
    deleteAttachment(id).catch(() => {});
  };

  return (
    <div className="fixed bottom-0 right-0 left-0 md:left-64 lg:left-68 p-4 bg-gradient-to-t from-[var(--color-canvas)] via-[var(--color-canvas)]/95 to-transparent pointer-events-none z-20 transition-all duration-200">
      <div className="max-w-3xl lg:max-w-4xl mx-auto pointer-events-auto">
        {/* Floating Input Container */}
        <form
          onSubmit={handleSubmit}
          className="relative flex flex-col bg-[var(--color-input-bg)] border border-[var(--color-input-border)] hover:border-zinc-300 dark:hover:border-zinc-700/80 focus-within:border-[var(--color-input-focus-border)] rounded-2xl px-3 py-2 shadow-lg shadow-zinc-900/5 dark:shadow-black/50 focus-within:shadow-[0_0_24px_rgba(99,102,241,0.12)] transition-all duration-200"
        >
          {/* File attachments chips preview above the input row if any */}
          {(attachments.length > 0 || uploading || uploadError) && (
            <div className="flex flex-wrap items-center gap-2 pb-2 mb-1.5 border-b border-zinc-100 dark:border-zinc-800/60">
              {attachments.map((attachment) => (
                <Attachment key={attachment.id} attachment={attachment} onRemove={removeAttachment} />
              ))}
              {uploading && (
                <span className="flex items-center gap-1.5 text-xs text-zinc-500 font-mono">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-500" /> Uploading documents...
                </span>
              )}
              {uploadError && <span className="text-xs text-red-500 font-medium">{uploadError}</span>}
            </div>
          )}

          {/* Unified horizontal row: [File Attach] [Auto-expanding Textarea] [Send / Stop Button] */}
          <div className="flex items-end gap-2 w-full">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={ACCEPT}
              onChange={handleFilesSelected}
              className="hidden"
            />

            {/* Left: File Attach Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="p-2 mb-0.5 rounded-xl text-zinc-400 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer shrink-0 disabled:opacity-50"
              title="Attach document or dataset"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            {/* Middle: Textarea that expands down and scrolls when long */}
            <textarea
              ref={textareaRef}
              rows={1}
              maxLength={4000}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={attachments.length > 0 ? 'Ask a question about your files...' : 'Ask Perplexity anything...'}
              disabled={disabled}
              className="flex-1 bg-transparent px-2 py-1.5 text-[14.5px] text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none resize-none leading-relaxed min-h-[38px] max-h-[160px] overflow-y-auto"
            />

            {/* Right: Submit or Stop Button */}
            <div className="shrink-0 flex items-center mb-0.5">
              {disabled && onStop ? (
                <button
                  type="button"
                  onClick={onStop}
                  className="w-8 h-8 rounded-full flex items-center justify-center bg-zinc-800 hover:bg-zinc-700 text-white dark:bg-zinc-700 dark:hover:bg-zinc-600 transition-all duration-150 cursor-pointer shadow-sm active:scale-95"
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
                      ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-500/25 active:scale-95'
                      : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-600 cursor-not-allowed'
                  }`}
                  title="Send message (Enter)"
                >
                  <ArrowUp className="w-4 h-4 stroke-[2.5]" />
                </button>
              )}
            </div>
          </div>
        </form>

        {/* Subtle Disclaimer Note */}
        <p className="text-[11px] text-zinc-400 dark:text-zinc-500 text-center mt-2 tracking-tight select-none font-sans">
          Perplexity may occasionally produce inaccurate information. Verify critical references.
        </p>
      </div>
    </div>
  );
};

export default ChatInput;