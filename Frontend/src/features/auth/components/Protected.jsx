import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router';
import AxiomLogo from '../../chat/components/header/AxiomLogo';

const Protected = ({ children }) => {
  const user = useSelector((state) => state.auth.user);
  const loading = useSelector((state) => state.auth.loading);

  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#f8fafc] dark:bg-[#0b0d13] transition-colors select-none">
        <div className="relative animate-pulse-glow">
          <AxiomLogo className="w-12 h-12" isIconOnly />
        </div>
        <span className="mt-4 text-xs font-mono text-zinc-400 dark:text-zinc-500 tracking-wider uppercase">
          Initializing Axiom...
        </span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default Protected;
