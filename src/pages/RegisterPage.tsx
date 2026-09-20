import { useState, useEffect, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  Mail,
  TriangleAlert,
  UserRound,
} from 'lucide-react';
import { AuthLayout } from '../components/auth/AuthLayout';
import { Button } from '../components/common/Button';
import { useAuth } from '../features/auth/AuthContext';
import { authErrorMessage } from '../features/auth/authErrors';
import {
  clearFailures,
  getLockRemainingSeconds,
  registerFailure,
} from '../features/auth/bruteForce';
import {
  PASSWORD_MIN_LENGTH,
  isEmailValid,
  validatePassword,
} from '../features/auth/passwordPolicy';
import { logAuthEvent } from '../features/auth/authLog';
import { clsx } from 'clsx';

const fieldCls =
  'w-full bg-[#0D1424] border border-[--color-border-primary]/70 rounded-lg py-2 text-sm text-[--color-text-primary] placeholder:text-[--color-text-muted]/60 focus:outline-none focus:border-[--color-accent-blue]';

function passwordStrength(
  pw: string,
): { score: number; label: string; color: string } {
  if (!pw) return { score: 0, label: '', color: '' };
  let score = 0;
  if (pw.length >= PASSWORD_MIN_LENGTH) score++;
  if (pw.length >= 10) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score >= 4) return { score, label: 'Forte', color: 'bg-[--color-accent-green]' };
  if (score >= 3) return { score, label: 'Boa', color: 'bg-[--color-accent-blue]' };
  if (score >= 2) return { score, label: 'Média', color: 'bg-[--color-accent-yellow]' };
  return { score, label: 'Fraca', color: 'bg-[--color-accent-red]' };
}

function Field({
  label,
  icon,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  children: (base: string) => React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-[--color-text-secondary]">
        {label}
      </span>
      <span className="relative block mt-1">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[--color-text-muted] pointer-events-none">
          {icon}
        </span>
        {children(fieldCls)}
      </span>
    </label>
  );
}

export function RegisterPage() {
  const { signUp, configured } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [lockSeconds, setLockSeconds] = useState(0);

  const key = email.trim().toLowerCase();
  const pwStrength = passwordStrength(password);

  useEffect(() => {
    const tick = () => setLockSeconds(getLockRemainingSeconds(key));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [key]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (getLockRemainingSeconds(key) > 0) {
      setError('Tentativas demais. Aguarde alguns minutos e tente novamente.');
      return;
    }

    setError('');

    if (!isEmailValid(email)) {
      setError('Digite um email válido.');
      return;
    }

    const pwError = validatePassword(password);
    if (pwError) {
      setError(pwError);
      return;
    }

    if (password !== confirm) {
      setError('As senhas não coincidem.');
      return;
    }

    setLoading(true);
    try {
      await signUp(email.trim(), password, name);
      clearFailures(key);
      logAuthEvent('register.success', { email });
      navigate('/dashboard');
    } catch (err) {
      logAuthEvent('register.failed', {
        email,
        detail:
          typeof err === 'object' && err !== null && 'code' in err
            ? String((err as { code: string }).code)
            : undefined,
      });
      registerFailure(key);
      setError(authErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <form
        onSubmit={handleSubmit}
        className="w-full rounded-xl border border-[--color-border-primary]/70 bg-[--color-bg-card] p-6 space-y-4"
      >
        <div className="text-center space-y-1">
          <h1 className="text-base font-bold text-[--color-text-primary]">
            Criar conta
          </h1>
          <p className="text-xs text-[--color-text-muted] leading-relaxed">
            Leve seu progresso para a nuvem e não perca nada.
          </p>
        </div>

        {!configured && (
          <div className="rounded-lg border border-[--color-accent-yellow]/30 bg-[--color-accent-yellow]/8 p-3 text-[11px] text-[--color-text-muted] leading-relaxed">
            <span className="font-semibold text-[--color-accent-yellow]">
              Firebase ainda não configurado.
            </span>{' '}
            Crie um arquivo .env com as credenciais para ativar o cadastro.
          </div>
        )}

        <Field label="Nome" icon={<UserRound size={14} />}>
          {(base) => (
            <input
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome"
              className={`${base} pl-9`}
            />
          )}
        </Field>

        <Field label="Email" icon={<Mail size={14} />}>
          {(base) => (
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="voce@exemplo.com"
              className={`${base} pl-9`}
            />
          )}
        </Field>

        <Field label="Senha" icon={<Lock size={14} />}>
          {(base) => (
            <span className="relative block">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                maxLength={128}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={`Mínimo ${PASSWORD_MIN_LENGTH} caracteres`}
                className={`${base} pl-9 pr-10`}
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
          )}
        </Field>

        {password && (
          <div className="-mt-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[--color-text-muted]">
                Força da senha
              </span>
              <span className="text-[10px] font-medium text-[--color-text-secondary]">
                {pwStrength.label}
              </span>
            </div>
            <div className="flex gap-1">
              {Array.from({ length: 4 }).map((_, i) => (
                <span
                  key={i}
                  className={clsx(
                    'h-1 flex-1 rounded-full transition-colors',
                    i < pwStrength.score ? pwStrength.color : 'bg-[--color-bg-tertiary]',
                  )}
                />
              ))}
            </div>
          </div>
        )}

        <Field label="Confirmar senha" icon={<Lock size={14} />}>
          {(base) => (
            <span className="relative block">
              <input
                type={showConfirm ? 'text' : 'password'}
                required
                maxLength={128}
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Repita a senha"
                className={`${base} pl-9 pr-10`}
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                tabIndex={-1}
                aria-label={showConfirm ? 'Ocultar senha' : 'Mostrar senha'}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-[--color-text-muted] hover:text-[--color-text-primary] cursor-pointer"
              >
                {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </span>
          )}
        </Field>

        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-[--color-accent-red]/30 bg-[--color-accent-red]/10 p-3 text-xs text-[--color-accent-red] leading-relaxed">
            <TriangleAlert size={14} className="shrink-0 mt-0.5" />
            {error}
          </div>
        )}

        <Button
          type="submit"
          disabled={loading || !configured || lockSeconds > 0}
          variant="accent"
          className="w-full"
        >
          {loading ? 'Criando conta…' : 'Criar conta'}
          {!loading && <ArrowRight size={12} />}
        </Button>

        <p className="text-[10px] text-[--color-text-muted] leading-relaxed">
          A senha deve ter pelo menos {PASSWORD_MIN_LENGTH} caracteres (sem
          exigência de símbolos) e não pode ser uma senha comum.
        </p>

        <p className="text-center text-[11px] text-[--color-text-muted]">
          Já tem conta?{' '}
          <Link
            to="/entrar"
            className="text-[--color-accent-cyan] font-semibold hover:underline"
          >
            Entrar
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}