import React from 'react';
import { User } from 'lucide-react';

const UserProfile = () => {
  return (
    <div className="flex items-center gap-3 px-1 py-1">
      {/* Avatar Icon */}
      <div className="w-9 h-9 rounded-full bg-[#1e5eff] flex items-center justify-center text-white shadow-md shadow-blue-500/20 shrink-0">
        <User className="w-5 h-5" />
      </div>

      {/* User Info */}
      <div className="flex flex-col min-w-0">
        <span className="text-[14px] font-semibold text-white tracking-tight truncate">
          Intelligence Pro
        </span>
        <span className="text-[11px] text-[#6b7a90] font-medium tracking-tight truncate">
          Researcher Tier &bull; v1.0.4
        </span>
      </div>
    </div>
  );
};

export default UserProfile;
