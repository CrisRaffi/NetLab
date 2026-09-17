import { useState, useEffect, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  Mail,
  TriangleAlert,
} from 'lucide-react';
import { AuthLayout } from '../components/auth/AuthLayout';
import { useAuth } from '../features/auth/AuthContext';
import { loginErrorMessage } from '../features/auth/authErrors';
import {
  clearFailures,
  getLockRemainingSeconds,
  registerFailure,
} from '../features/auth/bruteForce';
import { logAuthEvent } from '../features/auth/authLog';

const fieldCls =
  'w-full bg-[#0D1424] border border-[--color-border-primary]/70 rounded-lg py-2 text-sm text-[--color-text-primary] placeholder:text-[--color-text-muted]/60 focus:outline-none focus:border-[--color-accent-blue]';

export function LoginPage() {
  const { signIn, configured } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [lockSeconds, setLockSeconds] = useState(0);

  const key = email.trim().toLowerCase();

  useEffect(() => {
    const tick = () => setLockSeconds(getLockRemainingSeconds(key));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [key]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!key) return;

    const remaining = getLockRemainingSeconds(key);
    if (remaining > 0) {
      setLockSeconds(remaining);
      setError(
        `Tentativas demais. Aguarde ${Math.ceil(remaining / 60)} min antes de tentar novamente.`,
      );
      return;
    }

    setError('');
    setLoading(true);
    try {
      await signIn(email, password);
      clearFailures(key);
      logAuthEvent('login.success', { email });
      navigate('/dashboard');
    } catch (err) {
      logAuthEvent('login.failed', {
        email,
        detail:
          typeof err === 'object' && err !== null && 'code' in err
            ? String((err as { code: string }).code)
            : undefined,
      });
      const locked = registerFailure(key);
      if (locked > 0) {
        setLockSeconds(locked);
        setError(
          `Tentativas demais. Aguarde ${Math.ceil(locked / 60)} min para tentar novamente.`,
        );
      } else {
        setError(loginErrorMessage(err));
      }
    } finally {
      setLoading(false);
    }
  }

  const disabled = loading || !configured || lockSeconds > 0;

  return (
    <AuthLayout>
      <form
        onSubmit={handleSubmit}
        className="w-full rounded-xl border border-[--color-border-primary]/70 bg-[--color-bg-card] p-6 space-y-4"
      >
        <div className="text-center space-y-1">
          <h1 className="text-base font-bold text-[--color-text-primary]">
            Entrar na conta
          </h1>
          <p className="text-xs text-[--color-text-muted] leading-relaxed">
            Use seu email e senha para sincronizar seu progresso.
          </p>
        </div>

        {!configured && (
          <div className="rounded-lg border border-[--color-accent-yellow]/30 bg-[--color-accent-yellow]/8 p-3 text-[11px] text-[--color-text-muted] leading-relaxed">
            <span className="font-semibold text-[--color-accent-yellow]">
              Firebase ainda não configurado.
            </span>{' '}
            Crie um arquivo .env com as credenciais (veja .env.example) para
            ativar o login.
          </div>
        )}

        <label className="block">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[--color-text-secondary]">
            Email
          </span>
          <span className="relative block mt-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[--color-text-muted] pointer-events-none">
              <Mail size={14} />
            </span>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="voce@exemplo.com"
              className={`${fieldCls} pl-9`}
            />
          </span>
        </label>

        <label className="block">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[--color-text-secondary]">
            Senha
          </span>
          <span className="relative block mt-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[--color-text-muted] pointer-events-none">
              <Lock size={14} />
            </span>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className={`${fieldCls} pl-9 pr-10`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              tabIndex={-1}
              aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-[--color-text-muted] hover:text-[--color-text-primary] cursor-pointer"
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </span>
        </label>

        <div className="flex items-center justify-end">
          <Link
            to="/recuperar-senha"
            className="text-[11px] text-[--color-text-muted] hover:text-[--color-accent-cyan] transition-colors"
          >
            Esqueci minha senha
          </Link>
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-[--color-accent-red]/30 bg-[--color-accent-red]/10 p-3 text-xs text-[--color-accent-red] leading-relaxed">
            <TriangleAlert size={14} className="shrink-0 mt-0.5" />
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={disabled}
          className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg bg-[--color-accent-blue]/10 text-[--color-accent-cyan] border border-[--color-accent-blue]/30 px-4 py-2 text-xs font-semibold transition-colors hover:bg-[--color-accent-blue]/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {loading
            ? 'Entrando…'
            : lockSeconds > 0
              ? `Bloqueado ${Math.ceil(lockSeconds / 60)} min`
              : 'Entrar'}
          {!loading && lockSeconds === 0 && <ArrowRight size={12} />}
        </button>

        <p className="text-center text-[11px] text-[--color-text-muted]">
          Nunca compartilhe sua senha. Ainda não tem conta?{' '}
          <Link
            to="/cadastro"
            className="text-[--color-accent-cyan] font-semibold hover:underline"
          >
            Cadastre-se
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
