import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  MessagesSquare,
  Send,
  MessageCircleQuestion,
  Users,
  ChevronDown,
  Sparkles,
  CornerDownRight,
  AlertTriangle,
  Trash2,
  CheckCircle,
  CheckCircle2,
} from 'lucide-react';
import { clsx } from 'clsx';
import { PageHeader } from '../components/common/PageHeader';
import { Button } from '../components/common/Button';
import { useAuth } from '../features/auth/AuthContext';
import { db } from '../lib/firebase';
import { toast } from '../stores/useToastStore';
import { UserHoverCard } from '../components/community/UserHoverCard';
import {
  subscribeChat,
  subscribeDoubts,
  sendChatMessage,
  sendDoubt,
  sendDoubtReply,
  deleteChatMessage,
  deleteDoubt,
  setDoubtResolved,
  type ChatMessage,
  type Doubt,
} from '../features/community/firestoreCommunity';

type Tab = 'chat' | 'duvidas';

const MAX_TEXT = 500;
const MAX_TITLE = 120;

const DOUBT_TOPICS = [
  { id: 'Geral', label: 'Geral' },
  { id: 'Modelos OSI/TCP-IP', label: 'Modelos OSI/TCP-IP' },
  { id: 'IPv4 / Subnetting', label: 'IPv4 / Subnetting' },
  { id: 'Ethernet / Switch', label: 'Ethernet / Switch' },
  { id: 'Serviços (DHCP/DNS)', label: 'Serviços (DHCP/DNS)' },
  { id: 'Simulador / Lab', label: 'Simulador / Lab' },
];

function timeLabel(ts: number): string {
  const d = new Date(ts);
  const now = new Date();
  const sameDay =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear();
  const hh = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  if (sameDay) return hh;
  return `${d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} · ${hh}`;
}

function isOwn(
  contentUid: string | undefined,
  contentEmail: string | undefined,
  userUid: string | undefined,
  userEmail: string | null | undefined,
): boolean {
  if (userUid && contentUid) return contentUid === userUid;
  return Boolean(userEmail && contentEmail && userEmail === contentEmail);
}

function ChatPanel() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(
    () =>
      subscribeChat((m) => {
        setMessages(m);
        setLoaded(true);
      }),
    [],
  );

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages.length]);

  async function handleSend() {
    const trimmed = text.trim();
    if (!trimmed || sending || !user) return;
    setSending(true);
    setError(null);
    try {
      await sendChatMessage({
        authorName: user.displayName ?? 'Aluno',
        authorEmail: user.email ?? undefined,
        authorUid: user.uid,
        text: trimmed.slice(0, MAX_TEXT),
        createdAt: Date.now(),
      });
      setText('');
      toast('success', 'Mensagem enviada!');
    } catch {
      setError('Não foi possível enviar. Verifique sua conexão e tente de novo.');
    } finally {
      setSending(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteChatMessage(id);
      toast('success', 'Mensagem excluída.');
    } catch {
      setError('Não foi possível excluir a mensagem.');
    }
    setConfirmDeleteId(null);
  }

  return (
    <div className="flex h-[560px] flex-col overflow-hidden rounded-xl border border-[--color-border-primary]/45 bg-[--color-bg-card]/70 backdrop-blur-sm card-shadow">
      <div className="flex items-center justify-between border-b border-[--color-border-primary]/40 px-4 py-3">
        <div className="flex items-center gap-2.5">
          <span className="text-[--color-accent-cyan] icon-glow-purple">
            <MessagesSquare size={16} />
          </span>
          <div>
            <h3 className="text-sm font-semibold text-[--color-text-primary] tracking-tight">
              Chat Geral
            </h3>
            <p className="text-[10px] text-[--color-text-muted]">
              {messages.length} mensagens
            </p>
          </div>
        </div>
        <span className="flex items-center gap-1.5 rounded-full border border-[--color-accent-green]/30 bg-[--color-accent-green]/10 px-2.5 py-1 text-[9px] font-semibold text-[--color-accent-green]">
          <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
          AO VIVO
        </span>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {!loaded ? (
          <div className="space-y-3 pt-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="flex items-end gap-2"
                style={{ flexDirection: i % 2 === 0 ? 'row' : 'row-reverse' }}
              >
                <div className="h-8 w-8 shrink-0 animate-pulse rounded-full bg-[--color-bg-tertiary]" />
                <div
                  className="animate-pulse rounded-2xl bg-[--color-bg-tertiary]"
                  style={{
                    width: `${60 + (i % 3) * 12}%`,
                    height: i % 2 === 0 ? 36 : 28,
                  }}
                />
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <MessagesSquare size={28} className="mb-2 text-[--color-text-muted]/50" />
            <p className="text-xs text-[--color-text-muted]">
              Nenhuma mensagem ainda.
            </p>
            <p className="text-[10px] text-[--color-text-muted]/70">
              Seja a primeira pessoa a cumprimentar a comunidade!
            </p>
          </div>
        ) : (
          messages.map((m, i) => {
            const mine = isOwn(m.authorUid, m.authorEmail, user?.uid, user?.email);
            const prev = messages[i - 1];
            const sameAuthor =
              prev &&
              isOwn(prev.authorUid, prev.authorEmail, m.authorUid, m.authorEmail);
            return (
              <div
                key={m.id}
                className={clsx(
                  'group flex items-end gap-2',
                  mine && 'flex-row-reverse',
                )}
              >
                {!sameAuthor && (
                  <UserHoverCard
                    uid={m.authorUid}
                    name={m.authorName}
                    side={mine ? 'right' : 'left'}
                  />
                )}
                <div
                  className={clsx(
                    'max-w-[78%] rounded-2xl px-3.5 py-2',
                    mine
                      ? 'rounded-br-md bg-[#4F46E5] text-white'
                      : 'rounded-bl-md border border-[--color-border-primary]/40 bg-[#0D1424]/80',
                  )}
                >
                  {!sameAuthor && (
                    <p
                      className={clsx(
                        'mb-0.5 text-[10px] font-semibold',
                        mine ? 'text-white/80' : 'text-[--color-accent-cyan]',
                      )}
                    >
                      {m.authorName}
                      {m.authorEmail && (
                        <span className="ml-1 font-normal text-[9px] opacity-60">
                          · {timeLabel(m.createdAt)}
                        </span>
                      )}
                    </p>
                  )}
                  <p className="break-words text-xs leading-relaxed">{m.text}</p>
                </div>
                {mine && (
                  <button
                    type="button"
                    onClick={() => {
                      if (confirmDeleteId === m.id) {
                        void handleDelete(m.id);
                      } else {
                        setConfirmDeleteId(m.id);
                        setTimeout(
                          () =>
                            setConfirmDeleteId((cur) =>
                              cur === m.id ? null : cur,
                            ),
                          2500,
                        );
                      }
                    }}
                    title={
                      confirmDeleteId === m.id
                        ? 'Clique de novo para confirmar'
                        : 'Excluir mensagem'
                    }
                    className={clsx(
                      'flex h-6 w-6 shrink-0 items-center justify-center rounded-lg transition-all cursor-pointer',
                      confirmDeleteId === m.id
                        ? 'bg-[--color-accent-red]/20 text-[--color-accent-red]'
                        : 'opacity-0 group-hover:opacity-100 text-[--color-text-muted] hover:text-[--color-accent-red] hover:bg-[--color-accent-red]/10',
                    )}
                    aria-label="Excluir mensagem"
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>

      <div className="border-t border-[--color-border-primary]/40 p-3">
        {!user ? (
          <div className="flex items-center justify-between gap-3 rounded-xl border border-[--color-accent-blue]/25 bg-[--color-accent-blue]/5 px-3.5 py-3">
            <p className="text-xs text-[--color-text-secondary]">
              Crie uma conta para participar do chat e enviar mensagens.
            </p>
            <Link
              to="/entrar"
              className="shrink-0 rounded-lg bg-[--color-accent-blue]/15 px-3 py-1.5 text-xs font-semibold text-[--color-accent-cyan] border border-[--color-accent-blue]/30 transition-colors hover:bg-[--color-accent-blue]/25"
            >
              Entrar
            </Link>
          </div>
        ) : (
          <>
            <div className="flex items-end gap-2">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value.slice(0, MAX_TEXT))}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    void handleSend();
                  }
                }}
                rows={2}
                placeholder={`Escreva algo como ${user.displayName?.split(' ')[0] ?? 'aluno'}...`}
                className="flex-1 resize-none rounded-xl border border-[--color-border-primary]/40 bg-[#0D1424]/80 px-3.5 py-2.5 text-xs text-[--color-text-primary] placeholder:text-[--color-text-muted] outline-none focus:border-[--color-accent-blue]/50"
              />
              <Button
                size="sm"
                onClick={handleSend}
                disabled={!text.trim() || sending}
              >
                <Send size={13} /> Enviar
              </Button>
            </div>
            <div className="mt-1.5 flex items-center justify-between text-[9px] text-[--color-text-muted]/60">
              <span>Enter para enviar · Shift+Enter para quebrar linha</span>
              <span>{text.length}/{MAX_TEXT}</span>
            </div>
          </>
        )}
        {error && (
          <p className="mt-1.5 text-[10px] text-[--color-accent-red]">{error}</p>
        )}
      </div>
    </div>
  );
}

function DoubtCard({
  doubt,
  user,
}: {
  doubt: Doubt;
  user?: { uid: string; email: string | null } | null;
}) {
  const [open, setOpen] = useState(false);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const mine = isOwn(doubt.authorUid, doubt.authorEmail, user?.uid, user?.email);

  async function handleReply() {
    const trimmed = reply.trim();
    if (!trimmed || sending || !user) return;
    setSending(true);
    setError(null);
    try {
      await sendDoubtReply(doubt.id, {
        authorName: user.email ? 'Você' : 'Aluno',
        authorEmail: user.email ?? undefined,
        authorUid: user.uid,
        text: trimmed.slice(0, MAX_TEXT),
        createdAt: Date.now(),
      });
      setReply('');
      toast('success', 'Resposta enviada.');
    } catch {
      setError('Não foi possível enviar a resposta.');
    } finally {
      setSending(false);
    }
  }

  async function handleDelete() {
    try {
      await deleteDoubt(doubt.id);
      toast('success', 'Dúvida excluída.');
    } catch {
      setError('Não foi possível excluir a dúvida.');
      setConfirmDelete(false);
    }
  }

  const replyCount = doubt.replies?.length ?? 0;

  return (
    <div className="rounded-xl border border-[--color-border-primary]/45 bg-[#0D1424]/70 p-4">
      <div className="flex items-start gap-3">
        <UserHoverCard
          uid={doubt.authorUid}
          name={doubt.authorName}
        />
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="text-xs font-semibold text-[--color-text-primary]">
              {doubt.authorName}
            </span>
            <span className="text-[10px] text-[--color-text-muted]">
              · {timeLabel(doubt.createdAt)}
            </span>
            <span className="rounded-full border border-[--color-accent-purple]/30 bg-[--color-accent-purple]/10 px-2 py-0.5 text-[10px] font-medium text-[--color-accent-purple]">
              {doubt.topic || 'Geral'}
            </span>
            {doubt.resolved && (
              <span className="inline-flex items-center gap-1 rounded-full border border-[--color-accent-green]/30 bg-[--color-accent-green]/10 px-2 py-0.5 text-[10px] font-medium text-[--color-accent-green]">
                <CheckCircle size={10} /> Resolvida
              </span>
            )}
          </div>
          <h4 className="mt-1 text-sm font-semibold text-[--color-accent-purple]">
            {doubt.title}
          </h4>
          <p className="mt-1 whitespace-pre-wrap text-xs leading-relaxed text-[--color-text-secondary]">
            {doubt.body}
          </p>
          <div className="mt-2.5 flex items-center gap-3">
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              className="flex items-center gap-1 text-[10px] font-medium text-[--color-accent-cyan] hover:text-[--color-text-primary] transition-colors cursor-pointer"
            >
              <ChevronDown
                size={12}
                className={clsx('transition-transform', open && 'rotate-180')}
              />
              {replyCount === 0
                ? 'Responder'
                : `${replyCount} resposta${replyCount > 1 ? 's' : ''}`}
            </button>
            {mine && (
              <button
                type="button"
                onClick={() => {
                  void setDoubtResolved(doubt.id, !doubt.resolved);
                }}
                className={clsx(
                  'flex items-center gap-1 text-[10px] font-medium transition-colors cursor-pointer',
                  doubt.resolved
                    ? 'text-[--color-accent-green] hover:text-[--color-text-primary]'
                    : 'text-[--color-text-muted] hover:text-[--color-accent-green]',
                )}
              >
                <CheckCircle2 size={11} />
                {doubt.resolved ? 'Reabrir dúvida' : 'Marcar como resolvida'}
              </button>
            )}
            {mine && (
              <button
                type="button"
                onClick={() => {
                  if (confirmDelete) {
                    void handleDelete();
                  } else {
                    setConfirmDelete(true);
                    setTimeout(() => setConfirmDelete(false), 2500);
                  }
                }}
                title={
                  confirmDelete ? 'Clique de novo para confirmar' : 'Excluir dúvida'
                }
                className={clsx(
                  'flex items-center gap-1 text-[10px] font-medium transition-colors cursor-pointer',
                  confirmDelete
                    ? 'text-[--color-accent-red]'
                    : 'text-[--color-text-muted] hover:text-[--color-accent-red]',
                )}
              >
                <Trash2 size={11} />
                {confirmDelete ? 'Confirmar exclusão?' : 'Excluir'}
              </button>
            )}
          </div>
        </div>
      </div>

      {open && (
        <div className="mt-3 space-y-2.5 border-t border-[--color-border-primary]/40 pt-3 pl-11">
          {(doubt.replies ?? []).map((r) => (
            <div key={r.id} className="flex items-start gap-2">
              <CornerDownRight
                size={12}
                className="mt-1 shrink-0 text-[--color-text-muted]/50"
              />
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-semibold text-[--color-text-secondary]">
                  {r.authorName}
                  {doubt.resolved && (
                    <span className="ml-1.5 inline-flex items-center gap-0.5 rounded-full border border-[--color-accent-yellow]/30 bg-[--color-accent-yellow]/10 px-1.5 py-0.5 text-[9px] font-semibold text-[--color-accent-yellow]">
                      <Sparkles size={8} /> Mentor
                    </span>
                  )}
                  <span className="ml-1 font-normal text-[9px] text-[--color-text-muted]">
                    · {timeLabel(r.createdAt)}
                  </span>
                </p>
                <p className="text-xs leading-relaxed text-[--color-text-primary]">
                  {r.text}
                </p>
              </div>
            </div>
          ))}
          {!user ? (
            <div className="flex items-center justify-between gap-3 rounded-lg border border-[--color-accent-blue]/25 bg-[--color-accent-blue]/5 px-3 py-2">
              <p className="text-[10px] text-[--color-text-secondary]">
                Entre para responder esta dúvida.
              </p>
              <Link
                to="/entrar"
                className="shrink-0 rounded-lg bg-[--color-accent-blue]/15 px-2.5 py-1 text-[10px] font-semibold text-[--color-accent-cyan] border border-[--color-accent-blue]/30 transition-colors hover:bg-[--color-accent-blue]/25"
              >
                Entrar
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-2 pt-1">
              <input
                value={reply}
                onChange={(e) => setReply(e.target.value.slice(0, MAX_TEXT))}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    void handleReply();
                  }
                }}
                placeholder="Escreva uma resposta..."
                className="flex-1 rounded-lg border border-[--color-border-primary]/40 bg-[#0A0E1A]/70 px-3 py-1.5 text-xs text-[--color-text-primary] placeholder:text-[--color-text-muted] outline-none focus:border-[--color-accent-blue]/50"
              />
              <button
                type="button"
                onClick={handleReply}
                disabled={!reply.trim() || sending}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[--color-accent-blue]/15 text-[--color-accent-cyan] border border-[--color-accent-blue]/30 transition-colors hover:bg-[--color-accent-blue]/25 disabled:opacity-40 cursor-pointer"
                aria-label="Enviar resposta"
              >
                <Send size={12} />
              </button>
            </div>
          )}
          {error && (
            <p className="text-[10px] text-[--color-accent-red]">{error}</p>
          )}
        </div>
      )}
    </div>
  );
}

function DoubtsPanel() {
  const { user } = useAuth();
  const [doubts, setDoubts] = useState<Doubt[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [topic, setTopic] = useState('Geral');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(
    () =>
      subscribeDoubts((d) => {
        setDoubts(d);
        setLoaded(true);
      }),
    [],
  );

  async function handleSubmit() {
    const t = title.trim();
    const b = body.trim();
    if (!t || !b || sending || !user) return;
    setSending(true);
    setError(null);
    try {
      await sendDoubt({
        authorName: user.displayName ?? 'Aluno',
        authorEmail: user.email ?? undefined,
        authorUid: user.uid,
        topic,
        title: t.slice(0, MAX_TITLE),
        body: b.slice(0, MAX_TEXT),
        createdAt: Date.now(),
      });
      setTitle('');
      setBody('');
      toast('success', 'Dúvida publicada!');
    } catch {
      setError('Não foi possível publicar. Verifique sua conexão e tente de novo.');
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 items-start">
      <div className="lg:col-span-2">
        <div className="rounded-xl border border-[--color-border-primary]/45 bg-[--color-bg-card]/70 backdrop-blur-sm card-shadow p-4">
          <div className="flex items-center gap-2.5 mb-3">
            <span className="text-[--color-accent-purple] icon-glow-purple">
              <MessageCircleQuestion size={16} />
            </span>
            <div>
              <h3 className="text-sm font-semibold text-[--color-text-primary] tracking-tight">
                Enviar uma dúvida
              </h3>
              <p className="text-[10px] text-[--color-text-muted]">
                Pergunte e receba respostas da comunidade.
              </p>
            </div>
          </div>
          {!user ? (
            <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-[--color-accent-blue]/30 bg-[--color-accent-blue]/5 px-4 py-6 text-center">
              <MessageCircleQuestion
                size={22}
                className="text-[--color-accent-blue]"
              />
              <p className="text-xs text-[--color-text-secondary]">
                Crie uma conta para publicar dúvidas na comunidade.
              </p>
              <Link
                to="/entrar"
                className="rounded-lg bg-[--color-accent-blue]/15 px-3 py-1.5 text-xs font-semibold text-[--color-accent-cyan] border border-[--color-accent-blue]/30 transition-colors hover:bg-[--color-accent-blue]/25"
              >
                Entrar
              </Link>
            </div>
          ) : (
            <>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value.slice(0, MAX_TITLE))}
                placeholder="Título da dúvida"
                className="w-full rounded-lg border border-[--color-border-primary]/40 bg-[#0D1424]/80 px-3 py-2 text-xs text-[--color-text-primary] placeholder:text-[--color-text-muted] outline-none focus:border-[--color-accent-purple]/50 mb-2"
              />
              <label className="block mb-2">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[--color-text-secondary] mb-1 block">
                  Tema
                </span>
                <select
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full rounded-lg border border-[--color-border-primary]/40 bg-[#0D1424]/80 px-3 py-2 text-xs text-[--color-text-primary] outline-none focus:border-[--color-accent-purple]/50 cursor-pointer"
                >
                  {DOUBT_TOPICS.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value.slice(0, MAX_TEXT))}
                rows={5}
                placeholder="Descreva sua dúvida com o máximo de detalhes..."
                className="w-full resize-none rounded-lg border border-[--color-border-primary]/40 bg-[#0D1424]/80 px-3 py-2 text-xs text-[--color-text-primary] placeholder:text-[--color-text-muted] outline-none focus:border-[--color-accent-purple]/50"
              />
              <div className="mt-1 mb-2 flex items-center justify-between text-[9px] text-[--color-text-muted]/60">
                <span>{body.length}/{MAX_TEXT}</span>
              </div>
              <Button
                size="sm"
                className="w-full"
                onClick={handleSubmit}
                disabled={!title.trim() || !body.trim() || sending}
              >
                <Send size={13} /> Publicar dúvida
              </Button>
              {error && (
                <p className="mt-2 text-center text-[10px] text-[--color-accent-red]">
                  {error}
                </p>
              )}
            </>
          )}
        </div>
      </div>

      <div className="lg:col-span-3 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[--color-text-primary]">
            Dúvidas recentes
          </h3>
          <span className="text-[10px] text-[--color-text-muted]">
            {doubts.length} publicada{doubts.length !== 1 ? 's' : ''}
          </span>
        </div>
        {!loaded ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse rounded-xl border border-[--color-border-primary]/40 bg-[--color-bg-card]/70 p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-[--color-bg-tertiary]" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-1/3 rounded bg-[--color-bg-tertiary]" />
                    <div className="h-3 w-2/3 rounded bg-[--color-bg-tertiary]" />
                    <div className="h-3 w-1/2 rounded bg-[--color-bg-tertiary]" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : doubts.length === 0 ? (
          <div className="flex h-48 flex-col items-center justify-center rounded-xl border border-dashed border-[--color-border-primary]/40 text-center">
            <MessageCircleQuestion
              size={26}
              className="mb-2 text-[--color-text-muted]/50"
            />
            <p className="text-xs text-[--color-text-muted]">
              Nenhuma dúvida ainda.
            </p>
            <p className="text-[10px] text-[--color-text-muted]/70">
              Seja a primeira pessoa a perguntar!
            </p>
          </div>
        ) : (
          doubts.map((d) => (
            <DoubtCard key={d.id} doubt={d} user={user} />
          ))
        )}
      </div>
    </div>
  );
}

export function CommunityPage() {
  const [tab, setTab] = useState<Tab>('duvidas');
  const online = Boolean(db);

  const tabs = useMemo(
    () =>
      [
        { id: 'chat' as Tab, label: 'Chat Geral', icon: MessagesSquare },
        { id: 'duvidas' as Tab, label: 'Dúvidas', icon: MessageCircleQuestion },
      ],
    [],
  );

  if (!online) {
    return (
      <div className="page-container space-y-6">
        <PageHeader
          title="Comunidade"
          subtitle="Converse e tire dúvidas com outros alunos."
          accent="purple"
          icon={<MessagesSquare size={19} />}
        />
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[--color-border-primary]/40 py-20 text-center">
          <AlertTriangle size={26} className="mb-3 text-[--color-accent-yellow]" />
          <p className="text-sm font-semibold text-[--color-text-primary]">
            Comunidade indisponível
          </p>
          <p className="mt-1 max-w-md text-xs text-[--color-text-muted]">
            Esta página depende do banco de dados da plataforma, que ainda não
            está configurado neste ambiente.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container space-y-5">
      <PageHeader
        title="Comunidade"
        subtitle="Converse no chat geral e envie dúvidas para a comunidade responder."
        accent="purple"
        icon={<MessagesSquare size={19} />}
        badge={
          <span className="flex items-center gap-1.5 rounded-full border border-[--color-accent-cyan]/30 bg-[--color-accent-cyan]/10 px-2.5 py-1 text-[10px] font-semibold text-[--color-accent-cyan]">
            <Users size={11} /> Colaborativo
          </span>
        }
      />

      <div className="flex items-center gap-2">
        {tabs.map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={clsx(
                'flex items-center gap-2 rounded-xl border px-4 py-2 text-xs font-semibold transition-all duration-150 cursor-pointer',
                active
                  ? 'border-[--color-accent-purple]/50 bg-[--color-accent-purple]/15 text-[--color-accent-purple]'
                  : 'border-[--color-border-primary]/40 bg-[--color-bg-card]/50 text-[--color-text-muted] hover:text-[--color-text-primary] hover:border-[--color-border-primary]/70',
              )}
            >
              <Icon size={14} />
              {t.label}
            </button>
          );
        })}
        <span className="ml-auto hidden sm:flex items-center gap-1.5 text-[10px] text-[--color-text-muted]">
          <Sparkles size={11} className="text-[--color-accent-purple]" />
          Respeito e colaboração sempre.
        </span>
      </div>

      {tab === 'chat' ? <ChatPanel /> : <DoubtsPanel />}
    </div>
  );
}