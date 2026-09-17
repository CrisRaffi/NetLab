import { useMemo, useState } from 'react';
import { GraduationCap, RotateCcw, X } from 'lucide-react';
import { useSimulatorStore, DEVICE_LABELS } from '../../stores/useSimulatorStore';
import type { Topology } from '../../types';
import { clsx } from 'clsx';

type Q = { prompt: string; options: string[]; answer: number };

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildQuestions(t: Topology): Q[] {
  const qs: Q[] = [];
  const add = (prompt: string, answer: string | undefined, pool: string[]) => {
    if (!answer) return;
    const options = shuffle([
      answer,
      ...shuffle(pool.filter((p) => p && p !== answer)).slice(0, 3),
    ]);
    qs.push({ prompt, options, answer: options.indexOf(answer) });
  };
  const ips = t.devices.flatMap((d) => d.interfaces.map((i) => i.ip).filter(Boolean)) as string[];
  const masks = t.devices.flatMap((d) => d.interfaces.map((i) => i.subnetMask).filter(Boolean)) as string[];
  const gws = t.devices.flatMap((d) => d.interfaces.map((i) => i.gateway).filter(Boolean)) as string[];
  const types = t.devices.map((d) => DEVICE_LABELS[d.type]);
  const nums = [0, 1, 2, 3, 4, 5, 6, 7, 8];

  add('Quantos equipamentos compõem esta rede?', String(t.devices.length), nums.map(String));
  add('Quantas conexões (cabos) existem nesta rede?', String(t.connections.length), nums.map(String));
  for (const d of t.devices.slice(0, 2)) {
    add(`Qual o tipo do equipamento "${d.name}"?`, DEVICE_LABELS[d.type], types);
    add(`Qual o IP da interface principal de "${d.name}"?`, d.interfaces.find((i) => i.ip)?.ip, ips);
    add(`Qual o gateway configurado em "${d.name}"?`, d.interfaces.find((i) => i.gateway)?.gateway, gws);
    add(`Qual a máscara de sub-rede de "${d.name}"?`, d.interfaces.find((i) => i.subnetMask)?.subnetMask, masks);
  }
  return qs.slice(0, 5);
}

export function TopologyQuiz({ onClose }: { onClose: () => void }) {
  const topology = useSimulatorStore((s) => s.topology);
  const questions = useMemo(() => buildQuestions(topology), [topology]);
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [correct, setCorrect] = useState(0);

  const q = questions[idx];
  const done = idx >= questions.length;

  const pick = (i: number) => {
    if (picked !== null) return;
    setPicked(i);
    if (i === q.answer) setCorrect((c) => c + 1);
  };
  const next = () => {
    setPicked(null);
    setIdx((i) => i + 1);
  };
  const restart = () => {
    setIdx(0);
    setPicked(null);
    setCorrect(0);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md rounded-2xl border border-[--color-border-primary]/60 bg-[--color-bg-card] shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[--color-border-primary]/40">
          <div className="flex items-center gap-2">
            <GraduationCap size={16} className="text-[--color-accent-purple]" />
            <span className="text-sm font-semibold text-[--color-text-primary]">Exercícios da rede</span>
          </div>
          <button onClick={onClose} className="p-1 rounded text-[--color-text-muted] hover:text-[--color-text-primary] hover:bg-white/5 cursor-pointer">
            <X size={15} />
          </button>
        </div>

        {questions.length === 0 ? (
          <div className="px-5 py-10 text-center text-xs text-[--color-text-muted]">
            Monte uma rede com dispositivos para gerar exercícios.
          </div>
        ) : done ? (
          <div className="px-5 py-8 text-center">
            <div className="text-2xl font-bold text-[--color-accent-purple] mb-1">
              {correct}/{questions.length}
            </div>
            <p className="text-xs text-[--color-text-muted] mb-5">respostas corretas</p>
            <button
              onClick={restart}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium border border-[--color-border-secondary] text-[--color-text-muted] hover:text-[--color-text-secondary] hover:bg-[#111A2C] cursor-pointer"
            >
              <RotateCcw size={12} /> Gerar novamente
            </button>
          </div>
        ) : (
          <div className="px-5 py-5">
            <div className="text-[10px] font-mono text-[--color-text-muted] mb-1">
              Pergunta {idx + 1} / {questions.length}
            </div>
            <p className="text-sm font-semibold text-[--color-text-primary] mb-4">{q.prompt}</p>
            <div className="space-y-2">
              {q.options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => pick(i)}
                  disabled={picked !== null}
                  className={clsx(
                    'w-full text-left rounded-lg border px-3 py-2 text-xs font-mono transition-colors cursor-pointer disabled:cursor-default',
                    picked === null
                      ? 'border-[--color-border-primary] bg-[#0D1424]/70 text-[--color-text-secondary] hover:border-[--color-accent-purple]/50'
                      : i === q.answer
                        ? 'border-[--color-accent-green]/50 bg-[--color-accent-green]/10 text-[--color-accent-green]'
                        : i === picked
                          ? 'border-[--color-accent-red]/50 bg-[--color-accent-red]/10 text-[--color-accent-red]'
                          : 'border-[--color-border-primary] text-[--color-text-muted] opacity-60',
                  )}
                >
                  {opt}
                </button>
              ))}
            </div>
            {picked !== null && (
              <button
                onClick={next}
                className="mt-4 w-full rounded-lg bg-gradient-to-r from-[--color-accent-blue] to-[#4F46E5] text-white text-xs font-semibold px-4 py-2.5 cursor-pointer hover:-translate-y-px transition-all"
              >
                {idx + 1 >= questions.length ? 'Ver resultado' : 'Próxima pergunta'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}