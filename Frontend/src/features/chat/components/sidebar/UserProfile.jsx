import React from 'react';
import { useSelector } from 'react-redux';
import { User } from 'lucide-react';

const UserProfile = () => {
  const user = useSelector((state) => state.auth.user);

  return (
    <div className="flex items-center gap-3 px-1 py-1">
      <div className="w-9 h-9 rounded-full bg-[#1e5eff] flex items-center justify-center text-white shadow-md shadow-blue-500/20 shrink-0">
        <User className="w-5 h-5" />
      </div>

      <div className="flex flex-col min-w-0">
        <span className="text-[14px] font-semibold text-white tracking-tight truncate">
          {user?.username || 'Guest'}
        </span>
        <span className="text-[11px] text-[#6b7a90] font-medium tracking-tight truncate">
          {user?.email || ''}
        </span>
      </div>
    </div>
  );
};

export default UserProfile;