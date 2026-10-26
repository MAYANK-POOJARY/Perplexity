import React from 'react';
import PerplexityLogo from '../header/PerplexityLogo';
import UserProfile from './UserProfile';
import NewThreadButton from './NewThreadButton';
import ThreadGroup from './ThreadGroup';
import SidebarFooter from './SidebarFooter';

const Sidebar = ({
  threads = [],
  activeThreadId,
  onSelectThread,
  onDeleteThread,
  onNewThread,
  isOpen = true,
  onCloseMobile,
}) => {
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-xs transition-opacity duration-200"
        />
      )}

      {/* Main Sidebar Container */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-64 md:w-68 bg-[var(--color-sidebar-bg)] border-r border-[var(--color-sidebar-border)] flex flex-col justify-between p-3.5 transition-all duration-200 ease-in-out shrink-0 select-none ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Top Section */}
        <div className="flex flex-col gap-3.5">
          {/* Header Brand */}
          <div className="px-2 pt-1 pb-0.5 flex items-center justify-between">
            <PerplexityLogo />
          </div>

          <UserProfile />
          <NewThreadButton onClick={onNewThread} />
        </div>

        {/* Scrollable Thread History */}
        <div className="flex-1 overflow-y-auto mt-4 pr-1 -mr-1 space-y-1">
          {threads.length > 0 ? (
            threads.map((group) => (
              <ThreadGroup
                key={group.category}
                group={group}
                activeThreadId={activeThreadId}
                onSelectThread={onSelectThread}
                onDeleteThread={onDeleteThread}
              />
            ))
          ) : (
            <div className="px-3 py-6 text-center text-xs text-zinc-400 dark:text-zinc-500">
              No previous threads yet.
            </div>
          )}
        </div>

        {/* Bottom Actions */}
        <SidebarFooter />
      </aside>
    </>
  );
};

export default Sidebar;
