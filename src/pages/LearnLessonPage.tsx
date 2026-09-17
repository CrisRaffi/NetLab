import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  BookOpen,
  GraduationCap,
  Info,
  Layers,
  Lightbulb,
  List,
  Play,
  TriangleAlert,
} from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import {
  DnsDiagram,
  EncapsulationDiagram,
  HandshakeDiagram,
  LayersDiagram,
} from '../components/lesson/Diagrams';
import { LESSONS, getLessonById, type LessonBlock } from '../data/lessons';
import { clsx } from 'clsx';

const DIAGRAMS = {
  layers: LayersDiagram,
  encapsulation: EncapsulationDiagram,
  handshake: HandshakeDiagram,
  dns: DnsDiagram,
} as const;

const DIAGRAM_PLAY_MS = {
  layers: 5500,
  encapsulation: 5200,
  handshake: 5300,
  dns: 3700,
} as const;

function DiagramFigure({ block }: { block: Extract<LessonBlock, { kind: 'diagram' }> }) {
  const [playing, setPlaying] = useState(false);
  const total = DIAGRAM_PLAY_MS[block.type];

  useEffect(() => {
    if (!playing) return;
    const t = setTimeout(() => setPlaying(false), total);
    return () => clearTimeout(t);
  }, [playing, total]);

  const Diagram = DIAGRAMS[block.type];

  return (
    <figure className="rounded-lg border border-[--color-border-primary]/70 bg-[--color-bg-card] p-3 max-w-5xl mx-auto w-full">
      <div className="relative">
        <Diagram playing={playing} />
        {!playing && (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            aria-label="Reproduzir animação do diagrama"
            title="Reproduzir animação"
            className="absolute top-2 right-2 z-20 flex h-8 w-8 items-center justify-center rounded-full border border-[--color-accent-cyan]/40 bg-[#1C2538]/90 text-[--color-accent-cyan] shadow-lg transition-colors hover:bg-[#273651] hover:border-[--color-accent-cyan]/50"
          >
            <Play size={14} />
          </button>
        )}
      </div>
      {block.caption && (
        <figcaption className="mt-2 text-[11px] text-[--color-text-muted] text-center leading-relaxed">
          {block.caption}
        </figcaption>
      )}
    </figure>
  );
}

function BlockView({ block }: { block: LessonBlock }) {
  if (block.kind === 'paragraph') {
    return (
      <p className="text-sm text-[--color-text-secondary] leading-relaxed">
        {block.text}
      </p>
    );
  }

  if (block.kind === 'list') {
    return (
      <ul className="space-y-1.5">
        {block.items.map((item, i) => (
          <li
            key={i}
            className="flex items-start gap-2 text-sm text-[--color-text-secondary] leading-relaxed"
          >
            <span className="mt-1.5 h-1 w-1 rounded-full bg-[--color-accent-blue] shrink-0" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    );
  }

  if (block.kind === 'callout') {
    const toneCls =
      block.tone === 'tip'
        ? 'border-[--color-accent-green]/30 bg-[--color-accent-green]/5'
        : block.tone === 'warning'
          ? 'border-[--color-accent-yellow]/30 bg-[--color-accent-yellow]/5'
          : 'border-[--color-accent-blue]/20 bg-[--color-accent-blue]/10';
    const textCls =
      block.tone === 'tip'
        ? 'text-[--color-accent-green]'
        : block.tone === 'warning'
          ? 'text-[--color-accent-yellow]'
          : 'text-[--color-accent-cyan]';
    const Icon =
      block.tone === 'tip'
        ? GraduationCap
        : block.tone === 'warning'
          ? TriangleAlert
          : Info;

    return (
      <div className={clsx('rounded-lg border p-4', toneCls)}>
        <div className="flex items-center gap-1.5 mb-2">
          <Icon size={13} className={clsx('shrink-0', textCls)} />
          <span
            className={clsx(
              'text-[10px] font-semibold uppercase tracking-wider',
              textCls,
            )}
          >
            {block.title}
          </span>
        </div>
        <p className="text-sm text-[--color-text-primary] leading-relaxed">
          {block.text}
        </p>
      </div>
    );
  }

  if (block.kind === 'analogy') {
    return (
      <div className="rounded-lg border border-[--color-accent-cyan]/20 bg-[--color-accent-cyan]/5 p-4">
        <div className="flex items-center gap-1.5 mb-2">
          <Lightbulb size={13} className="shrink-0 text-[--color-accent-cyan]" />
          <span className="text-[10px] font-semibold text-[--color-accent-cyan] uppercase tracking-wider">
            Analogia do dia a dia
          </span>
        </div>
        <p className="text-sm text-[--color-text-secondary] leading-relaxed">
          {block.text}
        </p>
      </div>
    );
  }

  if (block.kind === 'diagram') {
    return <DiagramFigure block={block} />;
  }

  // table
  return (
    <div className="rounded-lg border border-[--color-border-primary]/70 overflow-x-auto">
      <table className="w-full text-left text-[13px]">
        <thead>
          <tr>
            {block.headers.map((h) => (
              <th
                key={h}
                className="px-3 py-2 border-b border-[--color-border-primary]/70 text-[10px] font-semibold text-[--color-text-secondary] uppercase tracking-wider"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {block.rows.map((row, ri) => (
            <tr key={ri}>
              {row.map((cell, ci) => (
                <td
                  key={ci}
                  className="px-3 py-2 border-b border-[--color-border-primary]/70 text-[--color-text-primary]"
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function LearnLessonPage() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const lesson = lessonId ? getLessonById(lessonId) : LESSONS[0];

  if (!lesson) {
    return (
      <div className="page-container">
        <PageHeader
          title="Conteúdo não encontrado"
          subtitle="Esta lição ainda não existe."
          accent="red"
          icon={<BookOpen size={19} />}
        />
      </div>
    );
  }

  return (
    <div className="page-container space-y-6">
      <PageHeader
        title={lesson.title}
        subtitle={lesson.subtitle}
        accent="blue"
        icon={<Layers size={19} />}
        actions={
          <Link
            to="/questionarios"
            className="inline-flex items-center gap-1.5 rounded-lg bg-[--color-accent-blue]/10 text-[--color-accent-cyan] border border-[--color-accent-blue]/30 px-4 py-2 text-xs font-semibold transition-colors hover:bg-[--color-accent-blue]/20"
          >
            <Play size={12} /> Praticar no questionário
          </Link>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-4">
        {/* TOC sidebar */}
        <aside className="space-y-4">
          <div className="rounded-xl border border-[--color-border-primary]/70 bg-[--color-bg-card] p-4 sticky top-4">
            <p className="section-label mb-2 flex items-center gap-1.5">
              <List size={11} /> Nesta lição
            </p>
            <div className="space-y-1">
              {lesson.sections.map((s, i) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className="flex items-center gap-2.5 px-2 py-1.5 rounded text-xs text-[--color-text-muted] transition-colors hover:text-[--color-text-primary] hover:bg-white/[0.04]"
                >
                  <span className="font-mono text-[10px] text-[--color-accent-blue] shrink-0">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  {s.title}
                </a>
              ))}
            </div>
          </div>
        </aside>

        {/* Content */}
        <div className="space-y-5 min-w-0">
          {lesson.sections.map((s, i) => (
            <section
              key={s.id}
              id={s.id}
              className="rounded-xl border border-[--color-border-primary]/70 bg-[--color-bg-card] p-5 space-y-3"
            >
              <h2 className="flex items-center gap-2 text-base font-semibold text-[--color-text-primary]">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[--color-bg-tertiary] text-[10px] font-bold text-[--color-accent-blue]">
                  {i + 1}
                </span>
                {s.title}
              </h2>
              <div className="space-y-3">
                {s.blocks.map((b, bi) => (
                  <BlockView key={bi} block={b} />
                ))}
              </div>
            </section>
          ))}

          {/* CTA */}
          <div className="rounded-xl border border-[--color-accent-blue]/30 bg-[--color-accent-blue]/10 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-[--color-text-primary]">
                Pronto para testar seus conhecimentos?
              </p>
              <p className="text-xs text-[--color-text-muted] mt-1">
                Responda o questionário sobre Camada de Transporte e PDUs. Se errar,
                o sistema te ensina o assunto na hora.
              </p>
            </div>
            <Link
              to="/questionarios"
              className="inline-flex items-center gap-1.5 rounded-lg bg-[--color-accent-blue]/10 text-[--color-accent-cyan] border border-[--color-accent-blue]/30 px-4 py-2 text-xs font-semibold transition-colors hover:bg-[--color-accent-blue]/20 shrink-0"
            >
              <Play size={12} /> Fazer o quiz
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}