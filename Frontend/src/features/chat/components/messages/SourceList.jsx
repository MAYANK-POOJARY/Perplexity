import { Globe } from 'lucide-react';

// "https://www.bbc.com/news/abc" -> "bbc.com"
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
    <div className="mb-3">
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-[#6b7a90]">
        Sources
      </p>
      <div className="flex flex-wrap gap-2">
        {sources.map((source) => (
          <a
            key={source.url}
            href={source.url}
            target="_blank"
            rel="noreferrer"
            className="flex w-45 flex-col gap-1 rounded-lg border border-[#2b374b] bg-[#151922] px-3 py-2 transition-colors hover:border-[#4b5d7e] hover:bg-[#1b2230]"
          >
            <span className="line-clamp-2 text-[12px] font-medium leading-snug text-[#c8d4e4]">
              {source.title}
            </span>
            <span className="flex items-center gap-1.5 text-[11px] text-[#7c8ca3]">
              <Globe className="h-3 w-3 shrink-0" />
              <span className="truncate">{getHostname(source.url)}</span>
            </span>
          </a>
        ))}
      </div>
    </div>
  );
};

export default SourceList;