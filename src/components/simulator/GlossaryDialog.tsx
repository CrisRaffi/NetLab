import { useMemo, useState } from 'react';
import { Search, BookOpen } from 'lucide-react';
import { Modal } from '../common/Modal';
import { GLOSSARY, type GlossaryTerm } from '../../data/glossary';

interface GlossaryDialogProps {
  open: boolean;
  onClose: () => void;
}

function highlight(text: string, query: string): React.ReactNode {
  if (!query) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-[--color-accent-blue]/30 text-inherit rounded-[2px]">
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  );
}

function TermRow({ term, query }: { term: GlossaryTerm; query: string }) {
  return (
    <li className="rounded-lg border border-[--color-border-primary]/40 bg-[#111A2C]/40 p-2.5">
      <p className="text-[11px] font-bold text-[--color-text-primary]">
        {highlight(term.term, query)}
      </p>
      <p className="text-[10px] text-[--color-text-secondary] leading-snug mt-0.5">
        {highlight(term.short, query)}
      </p>
      <p className="text-[10px] text-[--color-text-muted] italic leading-snug mt-1">
        {highlight(term.lay, query)}
      </p>
    </li>
  );
}

export function GlossaryDialog({ open, onClose }: GlossaryDialogProps) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return GLOSSARY;
    return GLOSSARY.map((cat) => ({
      ...cat,
      terms: cat.terms.filter(
        (t) =>
          t.term.toLowerCase().includes(q) ||
          t.short.toLowerCase().includes(q) ||
          t.lay.toLowerCase().includes(q),
      ),
    })).filter((cat) => cat.terms.length > 0);
  }, [query]);

  const total = GLOSSARY.reduce((n, c) => n + c.terms.length, 0);

  return (
    <Modal open={open} onClose={onClose} title="Glossário de Redes" size="xl">
      <div className="space-y-4">
        <p className="text-[11px] text-[--color-text-muted] leading-relaxed">
          Termos em linguagem simples para acompanhar o laboratório — do cabo ao
          pacote. Use a busca para achar um termo rápido.
        </p>

        <div className="relative">
          <Search
            size={13}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[--color-text-muted] pointer-events-none"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar termo (ex: gateway, flooding, ARP...)"
            className="w-full bg-[#0D1424] border border-[--color-border-primary]/70 rounded-lg pl-8 pr-3 py-2 text-[11px] text-[--color-text-primary] placeholder:text-[--color-text-muted]/60 focus:outline-none focus:border-[--color-accent-blue]"
          />
        </div>

        {filtered.length === 0 ? (
          <p className="text-[11px] text-[--color-text-muted] py-6 text-center">
            Nenhum termo encontrado para "{query}".
          </p>
        ) : (
          filtered.map((cat) => (
            <section key={cat.id}>
              <h4 className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[--color-accent-cyan] mb-2">
                <BookOpen size={11} />
                {cat.label}
              </h4>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {cat.terms.map((t) => (
                  <TermRow key={t.term} term={t} query={query.trim()} />
                ))}
              </ul>
            </section>
          ))
        )}

        <p className="text-[9px] text-[--color-text-muted]/70 pt-1 border-t border-[--color-border-primary]/40">
          {total} termos · dicas rápidas também aparecem ao passar o mouse em
          campos e pacotes.
        </p>
      </div>
    </Modal>
  );
}