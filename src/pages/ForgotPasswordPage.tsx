import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, KeyRound, Mail, TriangleAlert } from 'lucide-react';
import { AuthLayout } from '../components/auth/AuthLayout';
import { useAuth } from '../features/auth/AuthContext';
import {
  clearFailures,
  getLockRemainingSeconds,
  registerFailure,
} from '../features/auth/bruteForce';
import { logAuthEvent } from '../features/auth/authLog';
import { isEmailValid } from '../features/auth/passwordPolicy';

const fieldCls =
  'w-full bg-[#0D1424] border border-[--color-border-primary]/70 rounded-lg py-2 text-sm text-[--color-text-primary] placeholder:text-[--color-text-muted]/60 focus:outline-none focus:border-[--color-accent-blue]';

export function ForgotPasswordPage() {
  const { resetPassword, configured } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (loading) return;

    const key = email.trim().toLowerCase();

    if (!isEmailValid(email)) {
      setError('Digite um email válido.');
      return;
    }
    if (getLockRemainingSeconds(key) > 0) {
      setError('Tentativas demais. Aguarde alguns minutos e tente novamente.');
      return;
    }

    setError('');
    setInfo('');
    setLoading(true);
    try {
      await resetPassword(email);
      clearFailures(key);
      logAuthEvent('reset.sent', { email });
      // mensagem neutra evita enumeração de contas (OWASP V2.5.3)
      setInfo(
        'Se o email estiver cadastrado, você receberá um link para redefinir sua senha.',
      );
    } catch {
      const locked = registerFailure(key);
      logAuthEvent('reset.failed', { email });
      if (locked > 0) {
        setError(
          `Tentativas demais. Aguarde ${Math.ceil(locked / 60)} min e tente novamente.`,
        );
      } else {
        setError(
          'Não foi possível solicitar a redefinição. Tente novamente em instantes.',
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout showBenefits={false}>
      <form
        onSubmit={handleSubmit}
        className="w-full rounded-xl border border-[--color-border-primary]/70 bg-[--color-bg-card] p-6 space-y-4"
      >
        <div className="text-center space-y-1">
          <div className="mx-auto w-10 h-10 rounded-xl bg-[--color-accent-blue]/10 border border-[--color-accent-blue]/30 flex items-center justify-center text-[--color-accent-cyan]">
            <KeyRound size={17} />
          </div>
          <h1 className="text-base font-bold text-[--color-text-primary]">
            Recuperar senha
          </h1>
          <p className="text-xs text-[--color-text-muted] leading-relaxed">
            Digite o email da sua conta e enviaremos um link para você criar uma
            nova senha.
          </p>
        </div>

        {!configured && (
          <div className="rounded-lg border border-[--color-accent-yellow]/30 bg-[--color-accent-yellow]/8 p-3 text-[11px] text-[--color-text-muted] leading-relaxed">
            <span className="font-semibold text-[--color-accent-yellow]">
              Firebase ainda não configurado.
            </span>{' '}
            Crie um arquivo .env com as credenciais para ativar o login.
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

        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-[--color-accent-red]/30 bg-[--color-accent-red]/10 p-3 text-xs text-[--color-accent-red] leading-relaxed">
            <TriangleAlert size={14} className="shrink-0 mt-0.5" />
            {error}
          </div>
        )}

        {info && (
          <div className="rounded-lg border border-[--color-accent-green]/30 bg-[--color-accent-green]/10 p-3 text-xs text-[--color-accent-green] leading-relaxed">
            {info}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !configured}
          className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg bg-[--color-accent-blue]/10 text-[--color-accent-cyan] border border-[--color-accent-blue]/30 px-4 py-2 text-xs font-semibold transition-colors hover:bg-[--color-accent-blue]/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {loading ? 'Enviando…' : 'Enviar link de recuperação'}
        </button>

        <p className="text-center">
          <Link
            to="/entrar"
            className="inline-flex items-center gap-1.5 text-[11px] text-[--color-text-muted] hover:text-[--color-accent-cyan] transition-colors"
          >
            <ArrowLeft size={12} /> Voltar para o login
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}