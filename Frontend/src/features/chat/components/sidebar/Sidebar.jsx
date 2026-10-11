import React from 'react';
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
  onLogout,
  onToggleTheme,
  isOpen = true,
  onCloseMobile,
}) => {
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/60 z-30 md:hidden backdrop-blur-xs"
        />
      )}

      {/* Main Sidebar Container */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-64 md:w-[260px] bg-[#101318] border-r border-[#191f2a] flex flex-col justify-between p-3.5 transition-transform duration-200 ease-in-out shrink-0 select-none ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Top Section */}
        <div className="flex flex-col gap-4">
          <UserProfile />
          <NewThreadButton onClick={onNewThread} />
        </div>

        {/* Scrollable Thread History */}
        <div className="flex-1 overflow-y-auto mt-4 pr-1 -mr-1 space-y-1">
          {threads.map((group) => (
            <ThreadGroup
              key={group.category}
              group={group}
              activeThreadId={activeThreadId}
              onSelectThread={onSelectThread}
              onDeleteThread={onDeleteThread}
            />
          ))}
        </div>

        {/* Bottom Actions */}
        <SidebarFooter onLogout={onLogout} onToggleTheme={onToggleTheme} />
      </aside>
    </>
  );
};

export default Sidebar;
