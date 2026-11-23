import { API_URL } from '../../../lib/env';

const GoogleButton = ({ label = 'Continue with Google' }) => {
  // a full-page redirect, not axios: the browser has to leave for Google's consent screen
  const handleClick = () => {
    window.location.href = `${API_URL}/api/auth/google`;
  };

  return (
    <>
      {/* divider */}
      <div className="flex items-center gap-3 my-5">
        <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
        <span className="text-[11px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500">or</span>
        <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
      </div>

      <button
        type="button"
        onClick={handleClick}
        className="w-full flex items-center justify-center gap-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/70 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-100 font-medium text-sm py-2.5 px-4 transition-all duration-150 active:scale-[0.985] cursor-pointer"
      >
        <svg className="w-4 h-4" viewBox="0 0 48 48" aria-hidden="true">
          <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z"/>
          <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4.1 7.1-10.1 7.1-17.5z"/>
          <path fill="#FBBC05" d="M10.5 28.7c-.5-1.4-.8-3-.8-4.7s.3-3.3.8-4.7l-7.9-6.1C.9 16.4 0 20.1 0 24s.9 7.6 2.6 10.8l7.9-6.1z"/>
          <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.5-5.8c-2.1 1.4-4.9 2.3-8.4 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z"/>
        </svg>
        <span>{label}</span>
      </button>
    </>
  );
};

export default GoogleButton;