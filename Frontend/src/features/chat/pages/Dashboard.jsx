import { useState } from "react";
import { Menu } from "lucide-react";
import Sidebar from "../components/sidebar/Sidebar";
import HeroGreeting from "../components/header/HeroGreeting";
import MessageList from "../components/messages/MessageList";
import ChatInput from "../components/input/ChatInput";
import { useChat } from "../hook/useChat";
import { useEffect } from "react";

const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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

  const handleToggleTheme = () => {
    // Theme toggle indicator / action
    console.log("Theme toggle clicked");
  };

  useEffect(() => {
    handleGetChats();
  }, [handleGetChats]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0f1115] text-[#e2e8f0] font-sans">
      {/* Left Sidebar */}
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
        onToggleTheme={handleToggleTheme}
        isOpen={isSidebarOpen}
        onCloseMobile={() => setIsSidebarOpen(false)}
      />

      {/* Main Workspace */}
      <main className="flex-1 flex flex-col h-full min-w-0 relative bg-[#0f1115]">
        {/* Mobile Header Bar */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-[#1b212c] bg-[#11141a]">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-1.5 rounded-lg text-[#8492a6] hover:text-white hover:bg-[#1c222e]"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-semibold text-sm text-white">
            Lumina Intelligence
          </span>
          <div className="w-5" />
        </div>

        {/* Scrollable Chat View Area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          {/* Lumina Intelligence Header Greeting */}
          <HeroGreeting />

          {/* Messages Stream */}
          {isLoading && (
            <p className="text-center text-sm text-[#8492a6]" role="status">
              Loading chat...
            </p>
          )}
          {error && (
            <p
              className="mx-auto max-w-3xl px-4 text-sm text-red-400"
              role="alert"
            >
              {error}
            </p>
          )}
          <MessageList
            messages={messages}
            isThinking={isThinking}
            onRegenerate={handleRegenerate}
          />
        </div>

        {/* Bottom Floating Input Bar */}
        <ChatInput
          onSendMessage={handleSendMessage}
          onStop={handleStopGeneration}
          disabled={isThinking || isStreaming}
        />
      </main>
    </div>
  );
};

export default Dashboard;
