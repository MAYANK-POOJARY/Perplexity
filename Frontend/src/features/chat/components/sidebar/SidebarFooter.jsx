import React from 'react';
import { SunMedium, LogOut } from 'lucide-react';
import { useAuth } from '../../../auth/hook/useAuth';

const SidebarFooter = ({ onToggleTheme }) => {

  const { handleLogout } = useAuth();

  return (
    <div className="flex flex-col gap-1 pt-3 border-t border-[#1b212c]">
      {/* Change Theme Button */}
      <button
        onClick={onToggleTheme}
        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] text-[#8492a6] hover:text-[#e2e8f0] hover:bg-[#151922] transition-colors cursor-pointer text-left"
      >
        <SunMedium className="w-4 h-4 text-[#8492a6]" />
        <span>Change Theme</span>
      </button>

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] text-[#8492a6] hover:text-[#ef4444] hover:bg-[#1f1619] transition-colors cursor-pointer text-left"
      >
        <LogOut className="w-4 h-4 text-[#8492a6]" />
        <span>Logout</span>
      </button>
    </div>
  );
};

export default SidebarFooter;
