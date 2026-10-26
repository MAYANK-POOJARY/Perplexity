import React from 'react';
import { Sun, Moon, LogOut } from 'lucide-react';
import { useAuth } from '../../../auth/hook/useAuth';
import { useTheme } from '../../../../lib/theme';

const SidebarFooter = () => {
  const { handleLogout } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="flex flex-col gap-1.5 pt-3 border-t border-zinc-200/80 dark:border-zinc-800/80">
      {/* Light / Dark Mode Toggle */}
      <button
        type="button"
        onClick={toggleTheme}
        className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-[13px] text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition-all duration-150 cursor-pointer text-left group select-none"
        title={`Switch to ${isDark ? 'Light' : 'Dark'} mode`}
      >
        <div className="flex items-center gap-2.5">
          {isDark ? (
            <Moon className="w-4 h-4 text-indigo-400 group-hover:-rotate-12 transition-transform duration-200" />
          ) : (
            <Sun className="w-4 h-4 text-amber-500 group-hover:rotate-45 transition-transform duration-200" />
          )}
          <span className="font-medium">{isDark ? 'Dark Mode' : 'Light Mode'}</span>
        </div>

        {/* Toggle switch pill */}
        <div
          className={`relative inline-flex h-4.5 w-8 shrink-0 cursor-pointer rounded-full border transition-colors duration-200 ${
            isDark
              ? 'bg-indigo-600 border-indigo-500'
              : 'bg-zinc-200 border-zinc-300'
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform duration-200 mt-[1px] ml-[1px] ${
              isDark ? 'translate-x-3.5' : 'translate-x-0'
            }`}
          />
        </div>
      </button>

      {/* Logout Button */}
      <button
        type="button"
        onClick={handleLogout}
        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] text-zinc-600 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors duration-150 cursor-pointer text-left"
      >
        <LogOut className="w-4 h-4 text-zinc-400 dark:text-zinc-500 group-hover:text-red-500" />
        <span className="font-medium">Sign Out</span>
      </button>
    </div>
  );
};

export default SidebarFooter;
