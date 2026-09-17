const CREDENTIAL_CODES = new Set([
  'auth/invalid-email',
  'auth/user-not-found',
  'auth/wrong-password',
  'auth/invalid-credential',
  'auth/missing-password',
]);

// Mensagem genérica — não diferencia "user not found" de "senha errada"
// para evitar enumeração de contas (OWASP V2.2.9 / V2.5.3).
export const LOGIN_GENERIC_ERROR =
  'Email ou senha incorretos. Verifique os dados digitados.';

const MESSAGES: Record<string, string> = {
  'auth/email-already-in-use': 'Este email já está cadastrado.',
  'auth/weak-password': 'A senha precisa ter pelo menos 6 caracteres.',
  'auth/too-many-requests':
    'Muitas tentativas. Aguarde alguns minutos e tente novamente.',
  'auth/network-request-failed': 'Falha de conexão. Verifique sua internet.',
  'auth/unavailable':
    'O login ainda não foi configurado. Adicione as credenciais do Firebase no arquivo .env.',
  'auth/operation-not-allowed':
    'Este tipo de login não está habilitado no Firebase.',
  'auth/user-disabled': 'Esta conta foi desativada.',
};

/** Mensagem para o fluxo de LOGIN: genérica para credenciais inválidas,
 *  específica apenas para problemas de rede/bloqueio (anti-enumeração). */
export function loginErrorMessage(err: unknown): string {
  const code =
    typeof err === 'object' && err !== null && 'code' in err
      ? String((err as { code: string }).code)
      : '';
  if (CREDENTIAL_CODES.has(code) || code === '') return LOGIN_GENERIC_ERROR;
  return MESSAGES[code] ?? LOGIN_GENERIC_ERROR;
}

/** Mensagem para REGISTRO/RECUPERAÇÃO — pode ser mais específica. */
export function authErrorMessage(err: unknown): string {
  const code =
    typeof err === 'object' && err !== null && 'code' in err
      ? String((err as { code: string }).code)
      : '';
  return MESSAGES[code] ?? 'Algo deu errado. Tente novamente.';
}