import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  CornerDownLeft,
  LayoutDashboard,
  Map as MapIcon,
  MessagesSquare,
  Gamepad2,
  Network,
  FlaskConical,
  Bug,
  ClipboardList,
  Trophy,
  Settings,
  BookOpen,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { clsx } from 'clsx';
import { LESSONS } from '../../data/lessons';
import { CONCEPT_DEFINITIONS } from '../../data/content/concepts';
import { INITIAL_EXERCISES } from '../../data/exercises';
import { QUIZZES } from '../../data/quizzes';

interface SearchItem {
  id: string;
  label: string;
  description?: string;
  to: string;
  group: 'Páginas' | 'Lições' | 'Conceitos' | 'Laboratórios' | 'Questionários';
  keywords: string;
  icon: React.ReactNode;
}

const GROUP_ORDER: SearchItem['group'][] = [
  'Páginas',
  'Lições',
  'Conceitos',
  'Laboratórios',
  'Questionários',
];

function buildIndex(): SearchItem[] {
  const pages: SearchItem[] = [
    { id: 'p-dashboard', label: 'Dashboard', description: 'Visão geral do seu progresso', to: '/dashboard', group: 'Páginas', keywords: 'inicio home painel progresso', icon: <LayoutDashboard size={13} /> },
    { id: 'p-mapa', label: 'Mapa de Aprendizado', description: 'Trilha guiada, conceito por conceito', to: '/mapa', group: 'Páginas', keywords: 'trilha conceitos niveis roadmap', icon: <MapIcon size={13} /> },
    { id: 'p-comunidade', label: 'Comunidade', description: 'Chat geral e dúvidas', to: '/comunidade', group: 'Páginas', keywords: 'chat duvidas forum conversa', icon: <MessagesSquare size={13} /> },
    { id: 'p-viagem', label: 'A Viagem do Pacote', description: 'Veja os dados do início ao fim', to: '/viagem', group: 'Páginas', keywords: 'pacote encapsulamento camadas osi', icon: <Gamepad2 size={13} /> },
    { id: 'p-simulador', label: 'Laboratório Livre', description: 'Monte redes e veja os pacotes na prática', to: '/simulador', group: 'Páginas', keywords: 'simulador rede canvas topologia', icon: <Network size={13} /> },
    { id: 'p-labs', label: 'Laboratórios', description: 'Exercícios passo a passo', to: '/labs', group: 'Páginas', keywords: 'labs exercicios praticar', icon: <FlaskConical size={13} /> },
    { id: 'p-troubleshooting', label: 'Troubleshooting', description: 'Quebrei a Rede! Cace falhas injetadas', to: '/troubleshooting', group: 'Páginas', keywords: 'falha corrigir bug diagnostico', icon: <Bug size={13} /> },
    { id: 'p-questionarios', label: 'Questionários', description: 'Teste o que você aprendeu', to: '/questionarios', group: 'Páginas', keywords: 'quiz prova avaliacao perguntas', icon: <ClipboardList size={13} /> },
    { id: 'p-conquistas', label: 'Conquistas', description: 'Troféus e medalhas', to: '/conquistas', group: 'Páginas', keywords: 'trofeu medalha logro', icon: <Trophy size={13} /> },
    { id: 'p-config', label: 'Configurações', description: 'Preferências e conta', to: '/config', group: 'Páginas', keywords: 'ajustes configuracao conta', icon: <Settings size={13} /> },
  ];

  const lessons: SearchItem[] = LESSONS.map((l) => ({
    id: `l-${l.id}`,
    label: l.title,
    description: l.subtitle,
    to: `/aprender/${l.id}`,
    group: 'Lições',
    keywords: `${l.title} ${l.subtitle} lição aprender`,
    icon: <BookOpen size={13} />,
  }));

  const concepts: SearchItem[] = Object.entries(CONCEPT_DEFINITIONS).map(
    ([id, c]) => ({
      id: `c-${id}`,
      label: c.name,
      description: `Conceito · Nível ${c.level}`,
      to: '/mapa',
      group: 'Conceitos',
      keywords: `${c.name} conceito nivel ${c.level}`,
      icon: <Layers size={13} />,
    }),
  );

  const labs: SearchItem[] = INITIAL_EXERCISES.map((ex) => ({
    id: `ex-${ex.id}`,
    label: ex.title,
    description: `${ex.category} · ${ex.estimatedTime} min · ${ex.xpReward} XP`,
    to: `/labs/${ex.id}`,
    group: 'Laboratórios',
    keywords: `${ex.title} ${ex.description} lab laboratorio`,
    icon: <FlaskConical size={13} />,
  }));

  const quizzes: SearchItem[] = QUIZZES.map((q) => ({
    id: `q-${q.id}`,
    label: q.name,
    description: `${q.topic} · ${q.questions.length} questões`,
    to: '/questionarios',
    group: 'Questionários',
    keywords: `${q.name} ${q.topic} quiz`,
    icon: <ClipboardList size={13} />,
  }));

  return [...pages, ...lessons, ...concepts, ...labs, ...quizzes];
}

const MAX_PER_GROUP = 4;

export function CommandSearch() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const index = useMemo(() => buildIndex(), []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const matches = index.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q) ||
        item.keywords.toLowerCase().includes(q),
    );
    const grouped = new Map<SearchItem['group'], SearchItem[]>();
    for (const item of matches) {
      if (!grouped.has(item.group)) grouped.set(item.group, []);
      if (grouped.get(item.group)!.length < MAX_PER_GROUP) {
        grouped.get(item.group)!.push(item);
      }
    }
    return GROUP_ORDER.filter((g) => grouped.has(g))
      .map((g) => ({ group: g, items: grouped.get(g)! }))
      .filter((g) => g.items.length > 0);
  }, [query, index]);

  const flat = useMemo(() => results.flatMap((r) => r.items), [results]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
      if (e.key === 'Escape') {
        setOpen(false);
        inputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  function go(item: SearchItem) {
    navigate(item.to);
    setOpen(false);
    setQuery('');
    inputRef.current?.blur();
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, flat.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const item = flat[active];
      if (item) go(item);
    }
  }

  return (
    <div className="relative w-full group">
      <Search
        size={15}
        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[--color-text-muted] transition-colors group-focus-within:text-[--color-accent-blue]"
      />
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setActive(0);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 120)}
        onKeyDown={onKeyDown}
        placeholder="Buscar conceito, laboratório, comando..."
        aria-label="Buscar"
        autoComplete="off"
        className={clsx(
          'w-full bg-[#0D1424]/80 border border-[--color-border-primary]/45 rounded-xl pl-10 pr-3 sm:pr-16 py-2 text-sm',
          'text-[--color-text-primary] placeholder:text-[--color-text-muted]/60',
          'focus:outline-none focus:border-[--color-accent-blue] focus:ring-2 focus:ring-[--color-accent-blue]/15 focus:bg-[#0D1424]',
          'transition-all duration-200',
          'hover:border-[--color-border-secondary]/80',
        )}
      />
      <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:flex items-center px-2 py-1 rounded-md border border-white/10 bg-white/5 text-[9px] text-[--color-text-muted] font-mono">
        Ctrl K
      </kbd>

      {open && results.length > 0 && (
        <div
          ref={listRef}
          className="absolute left-0 right-0 top-full mt-2 rounded-xl border border-[--color-border-primary] bg-[--color-bg-card] shadow-2xl shadow-black/50 overflow-hidden z-50 glass-strong animate-fade-in-up"
        >
          {results.map(({ group, items }) => (
            <div key={group} className="py-1">
              <p className="px-3 pt-1.5 pb-1 text-[10px] font-semibold uppercase tracking-wider text-[--color-text-muted]">
                {group}
              </p>
              {items.map((item) => {
                const idx = flat.indexOf(item);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => go(item)}
                    onMouseEnter={() => setActive(idx)}
                    className={clsx(
                      'flex w-full items-center gap-3 px-3 py-2 text-left transition-colors cursor-pointer',
                      idx === active
                        ? 'bg-[--color-accent-blue]/10'
                        : 'hover:bg-white/[0.04]',
                    )}
                  >
                    <span
                      className={clsx(
                        'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border',
                        idx === active
                          ? 'border-[--color-accent-blue]/30 bg-[--color-accent-blue]/15 text-[--color-accent-blue]'
                          : 'border-[--color-border-primary]/60 bg-[--color-bg-tertiary]/50 text-[--color-text-muted]',
                      )}
                    >
                      {item.icon}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span
                        className={clsx(
                          'block truncate text-xs font-medium',
                          idx === active
                            ? 'text-[--color-text-primary]'
                            : 'text-[--color-text-secondary]',
                        )}
                      >
                        {item.label}
                      </span>
                      {item.description && (
                        <span className="block truncate text-[11px] text-[--color-text-muted]">
                          {item.description}
                        </span>
                      )}
                    </span>
                    <CornerDownLeft
                      size={12}
                      className={clsx(
                        'shrink-0 text-[--color-text-muted]/60',
                        idx !== active && 'opacity-0',
                      )}
                    />
                  </button>
                );
              })}
            </div>
          ))}
          <div className="flex items-center justify-between border-t border-[--color-border-primary]/40 px-3 py-1.5 text-[10px] text-[--color-text-muted]">
            <span className="flex items-center gap-1">
              <ArrowRight size={10} /> Clique para abrir
            </span>
            <span className="flex items-center gap-1 font-mono">
              ↑↓ navegar · Enter abrir · Esc fechar
            </span>
          </div>
        </div>
      )}

      {open && query.trim() && results.length === 0 && (
        <div className="absolute left-0 right-0 top-full mt-2 rounded-xl border border-[--color-border-primary] bg-[--color-bg-card] shadow-2xl shadow-black/50 overflow-hidden z-50 glass-strong animate-fade-in-up p-4 text-center">
          <p className="text-xs text-[--color-text-muted]">
            Nada encontrado para "{query.trim()}"
          </p>
        </div>
      )}
    </div>
  );
}