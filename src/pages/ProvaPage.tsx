import { FileQuestion, Hourglass } from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { Badge } from '../components/common/Badge';

export function ProvaPage() {
  return (
    <div className="page-container space-y-3">
      <PageHeader
        title="Modo Prova"
        subtitle="Avaliações cronometradas sem dicas."
        accent="red"
        icon={<FileQuestion size={19} />}
        badge={
          <Badge tone="yellow">
            <Hourglass size={11} /> Em breve
          </Badge>
        }
      />
      <div className="flex flex-col items-center justify-center py-8 rounded-xl border border-dashed border-[--color-border-primary] bg-[--color-bg-card]">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[--color-bg-tertiary] border border-[--color-border-primary]/70 mb-2">
          <FileQuestion size={28} className="text-[--color-text-muted]" />
        </span>
        <p className="text-sm text-[--color-text-secondary] mb-1">Modo Prova</p>
        <p className="text-xs text-[--color-text-muted] text-center max-w-sm leading-relaxed">
          Avaliações cronometradas sem dicas. Será implementado nas próximas
          fases.
        </p>
      </div>
    </div>
  );
}
