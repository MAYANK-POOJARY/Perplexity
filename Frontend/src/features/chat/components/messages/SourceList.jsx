import React from 'react';
import { Globe, ExternalLink } from 'lucide-react';

const getHostname = (url) => {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
};

const SourceList = ({ sources }) => {
  if (!sources?.length) return null;

  return (
    <div className="mb-4 select-none">
      <div className="flex items-center gap-1.5 mb-2">
        <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          Sources ({sources.length})
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {sources.map((source, index) => (
          <a
            key={source.url + index}
            href={source.url}
            target="_blank"
            rel="noreferrer"
            className="group flex items-center gap-2 p-2 rounded-xl border border-zinc-200/90 dark:border-zinc-800/80 bg-zinc-50/70 hover:bg-white dark:bg-zinc-900/60 dark:hover:bg-zinc-800/80 transition-all duration-150 hover:shadow-sm hover:border-indigo-400/40"
            title={source.title}
          >
            <div className="w-5 h-5 rounded-md bg-zinc-200/80 dark:bg-zinc-800 flex items-center justify-center shrink-0 text-[10px] font-mono font-semibold text-indigo-600 dark:text-indigo-400">
              {index + 1}
            </div>

            <div className="min-w-0 flex-1 leading-tight">
              <span className="block truncate text-[11.5px] font-medium text-zinc-800 dark:text-zinc-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {source.title || getHostname(source.url)}
              </span>
              <span className="flex items-center gap-1 text-[10px] text-zinc-400 dark:text-zinc-500 font-mono truncate">
                <Globe className="w-2.5 h-2.5 shrink-0" />
                <span className="truncate">{getHostname(source.url)}</span>
              </span>
            </div>

            <ExternalLink className="w-3 h-3 text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mr-0.5" />
          </a>
        ))}
      </div>
    </div>
  );
};

export default SourceList;