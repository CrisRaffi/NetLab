import { Link } from 'react-router-dom';

const PLAYER_URL = 'https://canaisembed.70noticias.com.br/player.php?id=premiere1';

export function JogoPage() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[--color-bg-primary]">
      <div className="flex items-center justify-between px-4 py-2 bg-[#020A14]/90 border-b border-[--color-border-primary]/20">
        <Link
          to="/"
          className="text-sm font-semibold text-[--color-accent-cyan] hover:underline"
        >
          ← Voltar
        </Link>
        <span className="text-xs text-[--color-text-muted]">
          Player de Testes
        </span>
      </div>
      <iframe
        src={PLAYER_URL}
        title="Player"
        className="flex-1 w-full border-0"
        allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}