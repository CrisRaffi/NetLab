import { Search } from 'lucide-react';
import { COMMAND_HELP } from '../../engine/commands';

function CommandSuggestBox({
  input,
  onRun,
}: {
  input: string;
  onRun: (cmd: string) => void;
}) {
  const tokens = input.trim().split(/\s+/);
  const current = tokens[tokens.length - 1] ?? '';
  if (!current || tokens.length > 1) return null;

  const matches = COMMAND_HELP.filter((c) => c.name.startsWith(current)).slice(0, 6);
  if (matches.length === 0) return null;

  return (
    <div className="absolute bottom-full left-0 right-0 mb-1 border border-[--color-border-primary] bg-[--color-bg-secondary] rounded-md shadow-xl overflow-hidden">
      <div className="flex items-center gap-1.5 px-2.5 py-1 text-[9px] uppercase tracking-wide text-[--color-text-muted] border-b border-[--color-border-primary]/60">
        <Search size={9} /> Sugestões de comando
      </div>
      {matches.map((c) => (
        <button
          key={c.name}
          type="button"
          onClick={() => onRun(c.name)}
          className="w-full text-left px-2.5 py-1.5 hover:bg-[--color-bg-hover] cursor-pointer transition-colors"
        >
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] text-[--color-accent-green]">{c.name}</span>
            <span className="text-[10px] text-[--color-text-muted] truncate">{c.usage}</span>
          </div>
          <p className="text-[10px] text-[--color-text-muted]/80 leading-snug mt-0.5">{c.description}</p>
        </button>
      ))}
    </div>
  );
}

export { CommandSuggestBox };