import React from 'react';
import { useSelector } from 'react-redux';
import { User, Sparkles } from 'lucide-react';

const UserProfile = () => {
  const user = useSelector((state) => state.auth.user);

  const initials = user?.username
    ? user.username.slice(0, 2).toUpperCase()
    : 'AX';

  return (
    <div className="flex items-center justify-between px-2 py-2 rounded-xl bg-zinc-100/70 hover:bg-zinc-200/50 dark:bg-zinc-900/40 dark:hover:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-800/60 transition-colors duration-150">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white text-xs font-semibold shadow-sm shrink-0">
          {initials}
        </div>

        <div className="flex flex-col min-w-0 leading-tight">
          <div className="flex items-center gap-1.5">
            <span className="text-[13px] font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight truncate">
              {user?.username || 'Guest'}
            </span>
          </div>
          <span className="text-[11px] text-zinc-500 dark:text-zinc-400 tracking-tight truncate">
            {user?.email || 'axiom.ai'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;