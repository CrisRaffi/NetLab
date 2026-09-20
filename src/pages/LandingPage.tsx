import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';
import {
  Network,
  TerminalSquare,
  Package,
  FlaskConical,
  Bug,
  ArrowRight,
  Star,
  Check,
  Cpu,
  Wifi,
  Server,
  Monitor,
  Router,
  Zap,
  Sparkles,
  ClipboardList,
  BookOpenText,
  CircleUserRound,
  MessagesSquare,
} from 'lucide-react';

const NAV = [
  { label: 'Recursos', href: '#recursos' },
  { label: 'Como funciona', href: '#como-funciona' },
  { label: 'Sobre', href: '#sobre' },
  { label: 'Depoimentos', href: '#depoimentos' },
];

const STATS = [
  { value: '9+', label: 'Tipos de dispositivos' },
  { value: '20+', label: 'Comandos de rede' },
  { value: '7', label: 'Camadas do modelo OSI' },
  { value: '100%', label: 'Prática gamificada' },
];

const FEATURES = [
  {
    icon: Network,
    tile: 'background:#6366f124;color:#818cf8;border-color:#6366f14d',
    title: 'Simulador Interativo',
    text: 'Monte topologias arrastando e conectando roteadores, switches, PCs e mais — sem precisar de equipamento real.',
  },
  {
    icon: TerminalSquare,
    tile: 'background:#38bdf824;color:#38bdf8;border-color:#38bdf84d',
    title: 'Terminal Realista',
    text: 'Execute ipconfig, ping, tracert, arp e veja a resposta em tempo real, como em um sistema operacional de verdade.',
  },
  {
    icon: Package,
    tile: 'background:#10b98124;color:#34d399;border-color:#10b9814d',
    title: 'A Viagem do Pacote',
    text: 'Veja o encapsulamento e desencapsulamento do dado camada por camada, do bit ao texto original.',
  },
  {
    icon: BookOpenText,
    tile: 'background:#8b5cf624;color:#a78bfa;border-color:#8b5cf64d',
    title: 'Lições com Diagramas',
    text: 'Lição da Camada de Transporte e PDUs com diagramas animados de handshake TCP, encapsulamento e DNS.',
  },
  {
    icon: ClipboardList,
    tile: 'background:#f59e0b24;color:#fbbf24;border-color:#f59e0b4d',
    title: 'Questionários Inteligentes',
    text: 'Cada questão errada vira uma explicação na hora — e há glossário de termos e revisão do gabarito.',
  },
  {
    icon: FlaskConical,
    tile: 'background:#22c55e24;color:#4ade80;border-color:#22c55e4d',
    title: 'Laboratórios Guiados',
    text: 'Exercícios passo a passo com validação automática, dicas progressivas e feedback imediato.',
  },
  {
    icon: Bug,
    tile: 'background:#f43f5e24;color:#fb7185;border-color:#f43f5e4d',
    title: 'Troubleshooting',
    text: 'Cace falhas injetadas na rede, diagnostique e corrija problemas reais como um profissional.',
  },
  {
    icon: CircleUserRound,
    tile: 'background:#14b8a624;color:#2dd4bf;border-color:#14b8a64d',
    title: 'Conta e Sincronização',
    text: 'Crie sua conta para sincronizar progresso e pontuações na nuvem, com recuperação de senha e proteção contra força bruta.',
  },
  {
    icon: MessagesSquare,
    tile: 'background:#a78bfa24;color:#c4b5fd;border-color:#a78bfa4d',
    title: 'Comunidade',
    text: 'Converse no chat geral com outros alunos e envie dúvidas para receber respostas — aprendizado é melhor em grupo.',
  },
];

const TESTIMONIALS = [
  { initials: 'DV', color: 'linear-gradient(135deg,#6366f1,#8b5cf6)', name: 'Diego Viana', role: 'Aluno de Redes', quote: 'Antes eu decorava a teoria e travava na prática. Agora monto a rede, conecto e testo com ping — faz muito mais sentido.' },
  { initials: 'MA', color: 'linear-gradient(135deg,#10b981,#059669)', name: 'Mariana Alves', role: 'Estudante de TI', quote: 'Ver o pacote atravessar as camadas e chegar ao destino foi o momento em que o modelo OSI finalmente clicou na minha cabeça.' },
  { initials: 'RS', color: 'linear-gradient(135deg,#38bdf8,#06b6d4)', name: 'Rafael Souza', role: 'Cursando CC', quote: 'Os laboratórios guiados me corrigem na hora. Aprendo errando e entendendo o porquê, sem travar por horas.' },
  { initials: 'CL', color: 'linear-gradient(135deg,#f59e0b,#f97316)', name: 'Camila Lima', role: 'Aluna', quote: 'O troubleshooting é viciante: caçar a falha e consertar sozinha me deu confiança para resolver na vida real.' },
  { initials: 'FT', color: 'linear-gradient(135deg,#f43f5e,#ec4899)', name: 'Felipe Torres', role: 'Técnico em formação', quote: 'A gamificação me manteve no ritmo. Cada nível e conquista me motivava a ir mais fundo nos conceitos.' },
];

function css(s: string): React.CSSProperties {
  const out: Record<string, string> = {};
  s.split(';').forEach((pair) => {
    const i = pair.indexOf(':');
    if (i > -1) out[pair.slice(0, i).trim()] = pair.slice(i + 1).trim();
  });
  return out as React.CSSProperties;
}

function NetworkMock() {
  const node = (x: number, y: number, label: string, icon: React.ReactNode) => (
    <div className="absolute flex flex-col items-center gap-1" style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' }}>
      <span className="flex items-center justify-center w-12 h-12 rounded-xl border border-[--color-border-primary]/60 bg-[--color-bg-secondary] text-[--color-accent-cyan]">
        {icon}
      </span>
      <span className="text-[9px] font-semibold text-[--color-text-secondary]">{label}</span>
    </div>
  );
  return (
    <div className="relative rounded-2xl border border-[--color-border-primary]/40 bg-[--color-bg-secondary]" style={{ height: 230 }}>
      <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none" />
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <line x1="18%" y1="42%" x2="82%" y2="42%" stroke="rgba(129,140,248,.45)" strokeWidth="2" strokeDasharray="6 6" />
        <line x1="34%" y1="42%" x2="26%" y2="72%" stroke="rgba(129,140,248,.3)" strokeWidth="2" strokeDasharray="6 6" />
        <line x1="50%" y1="42%" x2="54%" y2="72%" stroke="rgba(129,140,248,.3)" strokeWidth="2" strokeDasharray="6 6" />
        <line x1="66%" y1="42%" x2="74%" y2="72%" stroke="rgba(129,140,248,.3)" strokeWidth="2" strokeDasharray="6 6" />
      </svg>
      {node(18, 42, 'ROUTER', <Router size={22} />)}
      {node(34, 42, 'SWITCH', <Network size={22} />)}
      {node(50, 42, 'AP', <Wifi size={22} />)}
      {node(66, 42, 'SERVER', <Server size={22} />)}
      {node(26, 72, 'PC-01', <Monitor size={20} />)}
      {node(54, 72, 'PC-02', <Cpu size={20} />)}
      {node(74, 72, 'NAS', <Server size={20} />)}
      <span className="absolute bottom-2 left-3 text-[9px] font-mono text-[--color-text-muted]">Rede doméstica · 192.168.1.0/24</span>
      <span className="absolute bottom-2 right-3 text-[9px] font-mono text-[--color-status-connected]">● operacional</span>
    </div>
  );
}

function LearnMock() {
  const tiles = [
    { label: 'Abertos', n: 12, color: '#6366f1' },
    { label: 'Em andamento', n: 7, color: '#f59e0b' },
    { label: 'Concluídos', n: 19, color: '#10b981' },
  ];
  return (
    <div className="rounded-2xl border border-[--color-border-primary]/40 bg-[--color-bg-secondary] p-4">
      <div className="flex items-center gap-2 mb-3">
        <Zap size={14} className="text-[--color-accent-yellow]" />
        <span className="text-xs font-semibold text-[--color-text-primary]">Seu progresso</span>
      </div>
      <div className="grid grid-cols-3 gap-2 mb-3">
        {tiles.map((t) => (
          <div key={t.label} className="rounded-xl border border-[--color-border-primary]/50 bg-[--color-bg-card] p-3">
            <div className="text-lg font-bold" style={{ color: t.color }}>{t.n}</div>
            <div className="text-[9px] text-[--color-text-muted]">{t.label}</div>
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-[--color-border-primary]/50 bg-[--color-bg-card] p-3">
        <div className="flex items-center justify-between text-[10px] text-[--color-text-muted] mb-1.5">
          <span>IPv4 · Sub-rede</span>
          <span className="font-mono text-[--color-accent-green]">100%</span>
        </div>
        <div className="h-1.5 rounded-full bg-[--color-bg-tertiary] overflow-hidden">
          <div className="h-full bg-gradient-to-r from-[--color-accent-blue] to-[--color-accent-cyan]" style={{ width: '100%' }} />
        </div>
      </div>
    </div>
  );
}

export function LandingPage() {
  const { user } = useAuth();
  const enterTo = user ? '/dashboard' : '/entrar';

  useEffect(() => {
    const els = document.querySelectorAll('.landing-reveal');
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('landing-revealed');
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <div className="h-full w-full overflow-y-auto bg-[--color-bg-primary] text-[--color-text-primary]">
      {/* Nav */}
      <header className="landing-nav">
        <div className="flex items-center justify-between gap-4 px-6" style={{ maxWidth: 1120, marginInline: 'auto', paddingTop: 14, paddingBottom: 14 }}>
          <div className="flex items-center gap-2.5">
            <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-[--color-accent-blue] to-[--color-accent-cyan] text-white font-bold text-sm glow-logo">
              NL
            </span>
            <span className="text-base font-semibold text-[--color-text-primary]">
              NetLab <strong className="landing-gradient">Rede</strong>
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-[13px] font-medium text-[--color-text-muted]">
            {NAV.map((n) => (
              <a key={n.label} href={n.href} className="hover:text-[--color-text-primary] transition-colors">
                {n.label}
              </a>
            ))}
          </nav>
          <Link to={enterTo} className="landing-menu-cta">
            Acessar o sistema
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden px-6" style={{ paddingTop: 64, paddingBottom: 40 }}>
        <div className="landing-hero-glow" />
        <div style={{ maxWidth: 1120, marginInline: 'auto' }}>
          <div className="text-center" style={{ maxWidth: 780, marginInline: 'auto' }}>
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold border border-[--color-accent-blue]/25 bg-[--color-accent-blue]/10 text-[--color-accent-cyan]" style={{ marginBottom: 22 }}>
              <Sparkles size={13} /> Simulador de Redes Interativo
            </span>
            <h1
              className="landing-heading font-bold leading-tight tracking-tight"
              style={{ fontSize: 'clamp(30px, 5vw, 46px)', marginBottom: 20 }}
            >
              Aprenda redes de computadores,
              <br />
              <span className="landing-gradient">montando, testando e explorando</span>
              <br />
              em um só lugar.
            </h1>
            <p className="text-base leading-relaxed text-[--color-text-secondary]" style={{ marginBottom: 32 }}>
              Monte topologias, configure IPs e veja o pacote atravessar a rede
              camada por camada — com terminal realista, laboratórios guiados,
              questionários com explicações e gamificação. Crie sua conta e leve
              seu progresso para qualquer dispositivo.
            </p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <Link to={enterTo} className="landing-btn landing-btn-primary">
                Acessar o sistema <ArrowRight size={16} />
              </Link>
              <a href="#recursos" className="landing-btn landing-btn-ghost">
                Conhecer recursos
              </a>
            </div>
          </div>

          {/* Mockup */}
          <div className="relative" style={{ maxWidth: 860, marginInline: 'auto', marginTop: 56 }}>
            <div className="rounded-2xl border border-[--color-border-primary]/40 bg-[--color-bg-secondary] shadow-lg overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-[--color-border-primary]/40">
                <span className="w-2 h-2 rounded-full" style={{ background: '#f43f5e' }} />
                <span className="w-2 h-2 rounded-full" style={{ background: '#f59e0b' }} />
                <span className="w-2 h-2 rounded-full" style={{ background: '#10b981' }} />
                <span className="flex-1 px-3 py-1 rounded-full bg-[--color-bg-primary] border border-[--color-border-primary]/50 text-[11px] text-[--color-text-muted] text-center font-mono" style={{ maxWidth: 200, marginLeft: 12 }}>
                  netlab.app
                </span>
              </div>
              <div className="p-4">
                <NetworkMock />
              </div>
            </div>
            <div className="landing-float hidden md:flex" style={{ left: -8, top: '30%' }}>
              <span className="flex items-center justify-center w-8 h-8 rounded-lg text-white" style={{ background: 'linear-gradient(135deg,#22c55e,#059669)' }}>
                <Monitor size={15} />
              </span>
              <div>
                <p className="text-xs font-semibold text-[--color-text-primary]">Ping concluído</p>
                <p className="text-[10px] text-[--color-text-muted]">PC → SERVER · 1ms</p>
              </div>
            </div>
            <div className="landing-float hidden md:flex" style={{ right: -8, top: '20%', animationDelay: '1.2s' }}>
              <span className="flex items-center justify-center w-8 h-8 rounded-lg text-white" style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
                <TerminalSquare size={15} />
              </span>
              <div>
                <p className="text-xs font-semibold text-[--color-text-primary]">Terminal aberto</p>
                <p className="text-[10px] text-[--color-text-muted]">ipconfig · arp -a</p>
              </div>
            </div>
            <div className="landing-float left-1/2" style={{ bottom: -24, transform: 'translateX(-50%)', animationDelay: '2.1s' }}>
              <span className="flex items-center justify-center w-8 h-8 rounded-lg text-white" style={{ background: 'linear-gradient(135deg,#f59e0b,#f97316)' }}>
                <Zap size={15} />
              </span>
              <div>
                <p className="text-xs font-semibold text-[--color-text-primary]">+50 XP</p>
                <p className="text-[10px] text-[--color-text-muted]">Laboratório concluído</p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4" style={{ marginTop: 56, maxWidth: 900, marginInline: 'auto' }}>
            {STATS.map((s) => (
              <div key={s.label} className="text-center">
                <div className="landing-gradient font-bold" style={{ fontSize: 22 }}>{s.value}</div>
                <div className="text-xs text-[--color-text-muted] mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recursos */}
      <section id="recursos" className="landing-reveal px-6" style={{ paddingTop: 56, paddingBottom: 56 }}>
        <div style={{ maxWidth: 1120, marginInline: 'auto' }}>
          <div className="text-center" style={{ maxWidth: 640, marginInline: 'auto', marginBottom: 48 }}>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[--color-accent-purple]">Recursos</span>
            <h2 className="font-bold tracking-tight mt-2 mb-3" style={{ fontSize: 'clamp(26px, 3.5vw, 32px)' }}>Tudo para dominar redes</h2>
            <p className="text-[15px] leading-relaxed text-[--color-text-secondary]">
              Ferramentas pensadas para aprender na prática, do primeiro cabo à
              resolução de um problema de rede.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="landing-feature">
                  <span
                    className="flex items-center justify-center border rounded-xl mb-4"
                    style={{ width: 46, height: 46, ...css(f.tile) }}
                  >
                    <Icon size={20} />
                  </span>
                  <h3 className="text-base font-bold mb-1.5">{f.title}</h3>
                  <p className="text-[13px] leading-relaxed text-[--color-text-secondary]">{f.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Como funciona */}
      <section id="como-funciona" className="landing-reveal px-6" style={{ paddingTop: 56, paddingBottom: 56 }}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center" style={{ maxWidth: 1120, marginInline: 'auto', gap: 40 }}>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[--color-accent-purple]">Como funciona</span>
            <h2 className="font-bold tracking-tight mt-2 mb-4" style={{ fontSize: 'clamp(26px, 3.5vw, 30px)' }}>Do zero ao domínio</h2>
            <p className="text-[15px] leading-relaxed text-[--color-text-secondary] mb-6">
              O NetLab transforma a teoria em experiência: você monta, configura,
              testa e avalia — recebendo feedback a cada passo.
            </p>
            <ul className="space-y-3">
              {[
                'Monte e conecte sua própria topologia de rede',
                'Configure IPs, máscaras, gateways e rotas',
                'Teste com comandos reais (ping, tracert, arp)',
                'Veja o pacote viajando pelas camadas OSI',
                'Aprenda com diagramas animados (handshake, PDU, DNS)',
                'Resolva falhas e ganhe XP, níveis e conquistas',
                'Reveja o que errou nos questionários com explicações',
                'Entre com sua conta e sincronize tudo na nuvem',
              ].map((t) => (
                <li key={t} className="flex items-center gap-3 text-sm text-[--color-text-secondary]">
                  <span className="flex items-center justify-center w-4 h-4 rounded-full bg-[--color-accent-green]/15 text-[--color-accent-green] shrink-0">
                    <Check size={11} />
                  </span>
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="landing-about-card">
            <h3 className="text-lg font-bold mb-2">Aprenda fazendo</h3>
            <p className="text-sm leading-relaxed text-[--color-text-secondary]" style={{ marginBottom: 20 }}>
              Cada laboratório é validado automaticamente: você sabe na hora se
              acertou e por quê — com dicas progressivas quando precisar.
            </p>
            <LearnMock />
          </div>
        </div>
      </section>

      {/* Sobre */}
      <section id="sobre" className="landing-reveal px-6" style={{ paddingTop: 56, paddingBottom: 56 }}>
        <div style={{ maxWidth: 1120, marginInline: 'auto' }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center" style={{ gap: 40 }}>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[--color-accent-purple]">Sobre</span>
              <h2 className="font-bold tracking-tight mt-2 mb-4" style={{ fontSize: 'clamp(26px, 3.5vw, 30px)' }}>Feito para quem aprende redes</h2>
              <p className="text-[15px] leading-relaxed text-[--color-text-secondary] mb-6">
                O NetLab nasceu para tornar o estudo de redes acessível e prático:
                um ambiente completo de simulação, exercícios e avaliação —
                acessível no navegador, sem instalar nada.
              </p>
              <div className="space-y-2.5">
                {['Funciona direto no navegador', 'Progresso salvo automaticamente', 'Conta opcional para sincronizar em qualquer dispositivo', 'Do básico ao troubleshooting avançado'].map((t) => (
                  <div key={t} className="flex items-center gap-3 text-sm text-[--color-text-secondary]">
                    <Check size={14} className="text-[--color-accent-green]" /> {t}
                  </div>
                ))}
              </div>
            </div>
            <div className="landing-about-card">
              <h3 className="text-lg font-bold mb-2">Suporte ao aprendizado</h3>
              <p className="text-sm leading-relaxed text-[--color-text-secondary]">
                Mapa de aprendizado, lições com diagramas animados, questionários
                que ensinam, laboratórios guiados, troubleshooting e modo prova
                trabalham juntos para você evoluir com consistência.
              </p>
              <div className="grid grid-cols-2 gap-3" style={{ marginTop: 24 }}>
                <div className="rounded-xl bg-[--color-bg-card]/60 border border-[--color-border-primary]/40 p-3.5">
                  <div className="text-base font-bold text-[--color-accent-purple]">Gamificado</div>
                  <div className="text-xs text-[--color-text-muted] mt-1">XP, níveis e conquistas</div>
                </div>
                <div className="rounded-xl bg-[--color-bg-card]/60 border border-[--color-border-primary]/40 p-3.5">
                  <div className="text-base font-bold text-[--color-accent-cyan]">Aprendizado ativo</div>
                  <div className="text-xs text-[--color-text-muted] mt-1">Prática em cada conceito</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Depoimentos */}
      <section id="depoimentos" className="landing-reveal px-6" style={{ paddingTop: 56, paddingBottom: 56 }}>
        <div style={{ maxWidth: 1120, marginInline: 'auto' }}>
          <div className="text-center" style={{ maxWidth: 640, marginInline: 'auto', marginBottom: 48 }}>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[--color-accent-purple]">Prova social</span>
            <h2 className="font-bold tracking-tight mt-2 mb-3" style={{ fontSize: 'clamp(26px, 3.5vw, 32px)' }}>Quem usa, recomenda</h2>
            <p className="text-[15px] leading-relaxed text-[--color-text-secondary]">
              Veja como o NetLab ajudou estudantes a dominarem redes na prática.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {TESTIMONIALS.map((t) => (
              <figure key={t.name} className="landing-testimonial">
                <div className="flex gap-1 text-[--color-accent-yellow] mb-3">
                  {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={13} />)}
                </div>
                <blockquote className="text-[13px] leading-relaxed text-[--color-text-secondary] mb-4">"{t.quote}"</blockquote>
                <figcaption className="flex items-center gap-3">
                  <span className="flex items-center justify-center rounded-full text-white font-bold" style={{ width: 34, height: 34, fontSize: 12, background: t.color }}>
                    {t.initials}
                  </span>
                  <div>
                    <div className="text-sm font-semibold text-[--color-text-primary]">{t.name}</div>
                    <div className="text-[11px] text-[--color-text-muted]">{t.role}</div>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="landing-reveal px-6" style={{ paddingTop: 64, paddingBottom: 64 }}>
        <div style={{ maxWidth: 860, marginInline: 'auto' }}>
          <div className="landing-cta-card">
            {Array.from({ length: 8 }).map((_, i) => (
              <span
                key={i}
                className="landing-particle"
                style={{
                  left: `${4 + i * 13}%`,
                  animationDelay: `${i * 0.55}s`,
                  animationDuration: `${4 + (i % 4)}s`,
                  background: ['var(--color-accent-cyan)', 'rgba(16,185,129,.7)', 'rgba(245,158,11,.6)'][i % 3],
                }}
              />
            ))}
            <div className="relative">
              <h2 className="font-bold tracking-tight mb-3" style={{ fontSize: 'clamp(26px, 3.5vw, 32px)' }}>Pronto para dominar redes?</h2>
              <p className="text-[15px] text-[--color-text-secondary]" style={{ marginBottom: 28 }}>Entre no sistema e comece a montar sua primeira rede agora.</p>
              <Link to={enterTo} className="landing-btn landing-btn-primary landing-btn-lg">
                Acessar o sistema <ArrowRight size={17} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[--color-border-primary]/40">
        <div className="flex items-center justify-between gap-4 flex-wrap px-6" style={{ maxWidth: 1120, marginInline: 'auto', paddingTop: 20, paddingBottom: 20 }}>
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-br from-[--color-accent-blue] to-[--color-accent-cyan] text-white text-[10px] font-bold">
              NL
            </span>
            <span className="text-sm font-semibold text-[--color-text-primary]">NetLab</span>
          </div>
          <span className="text-xs text-[--color-text-muted]">© 2026 NetLab — Simulador de Redes</span>
        </div>
      </footer>
    </div>
  );
}