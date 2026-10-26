import { useState, useEffect } from "react";
import { Menu } from "lucide-react";
import Sidebar from "../components/sidebar/Sidebar";
import HeroGreeting from "../components/header/HeroGreeting";
import MessageList from "../components/messages/MessageList";
import ChatInput from "../components/input/ChatInput";
import AxiomLogo from "../components/header/AxiomLogo";
import { useChat } from "../hook/useChat";

const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState("");

  const {
    threads,
    activeThreadId,
    messages,
    isLoading,
    isThinking,
    error,
    isStreaming,
    handleSelectThread,
    handleNewThread,
    handleSendMessage,
    handleGetChats,
    handleDeleteChat,
    handleStopGeneration,
    handleRegenerate,
  } = useChat();

  useEffect(() => {
    handleGetChats();
  }, [handleGetChats]);

  // Global keyboard shortcut: ⌘K or Ctrl+K for new thread
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        handleNewThread();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNewThread]);

  // Find active thread title if any
  const allItems = threads.flatMap((g) => g.items || []);
  const activeThread = allItems.find((t) => t.id === activeThreadId);
  const threadTitle = activeThread ? activeThread.title.replace(/["'*]/g, '') : null;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[var(--color-canvas)] text-[var(--color-canvas-text)] font-sans antialiased">
      {/* Collapsible Left Sidebar */}
      <Sidebar
        threads={threads}
        activeThreadId={activeThreadId}
        onSelectThread={(id) => {
          handleSelectThread(id);
          setIsSidebarOpen(false);
        }}
        onDeleteThread={handleDeleteChat}
        onNewThread={() => {
          handleNewThread();
          setIsSidebarOpen(false);
        }}
        isOpen={isSidebarOpen}
        onCloseMobile={() => setIsSidebarOpen(false)}
      />

      {/* Main Workspace Stage */}
      <main className="flex-1 flex flex-col h-full min-w-0 relative bg-[var(--color-canvas)] transition-colors duration-200">
        {/* Top Header Navigation Bar */}
        <header className="sticky top-0 z-10 flex items-center justify-between px-4 sm:px-6 py-3 border-b border-[var(--color-border)] bg-[var(--color-surface)]/80 backdrop-blur-md select-none">
          {/* Left Controls */}
          <div className="flex items-center gap-3 min-w-0">
            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              aria-label="Open navigation drawer"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumb / Title */}
            <div className="flex items-center gap-2 truncate">
              <div className="md:hidden">
                <AxiomLogo className="w-6 h-6" isIconOnly />
              </div>

              {threadTitle ? (
                <span className="font-medium text-sm text-zinc-800 dark:text-zinc-200 truncate max-w-[200px] sm:max-w-md">
                  {threadTitle}
                </span>
              ) : (
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                    Axiom
                  </span>
                  <span className="text-zinc-400 dark:text-zinc-600">/</span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    New Thread
                  </span>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Scrollable Conversation Stream */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          {/* Empty State: Greeting & Starter Cards */}
          {messages.length === 0 && (
            <HeroGreeting onSelectPrompt={(prompt) => setSelectedPrompt(prompt)} />
          )}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex items-center justify-center gap-2 py-8 text-xs text-zinc-400 dark:text-zinc-500 font-mono" role="status">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
              Loading conversation...
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div
              className="mx-auto max-w-2xl my-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-600 dark:text-red-400 text-center font-medium"
              role="alert"
            >
              {error}
            </div>
          )}

          {/* Render Messages */}
          {messages.length > 0 && (
            <MessageList
              messages={messages}
              isThinking={isThinking}
              onRegenerate={handleRegenerate}
            />
          )}
        </div>

        {/* Floating Input Dock */}
        <ChatInput
          onSendMessage={handleSendMessage}
          onStop={handleStopGeneration}
          disabled={isThinking || isStreaming}
          initialPrompt={selectedPrompt}
          onPromptUsed={() => setSelectedPrompt("")}
        />
      </main>
    </div>
  );
};

export default Dashboard;
