import type { ConceptProgress } from '../stores/useProgressStore';
import { CONCEPT_DEFINITIONS } from './content/concepts';

function getWeakConcepts(concepts: ConceptProgress[]): Array<{ conceptId: string; name: string; level: number }> {
  const weak = concepts.filter(c => c.mastery < 50 && c.attempts > 0);
  return weak.map(c => {
    const def = CONCEPT_DEFINITIONS[c.conceptId];
    return { conceptId: c.conceptId, name: def ? def.name : c.conceptId, level: def ? def.level : 0 };
  }).filter(c => c.name !== undefined);
}

function getDueForReview(concepts: ConceptProgress[]): Array<{ conceptId: string; name: string; level: number }> {
  const now = new Date();
  const due = concepts.filter(c => c.nextReview && new Date(c.nextReview) <= now);
  return due.map(c => {
    const def = CONCEPT_DEFINITIONS[c.conceptId];
    return { conceptId: c.conceptId, name: def ? def.name : c.conceptId, level: def ? def.level : 0 };
  }).filter(c => c.name !== undefined);
}

function getReinforcementSuggestions(concepts: ConceptProgress[]): Array<{
  conceptId: string;
  conceptName: string;
  suggestedExercises: string[];
  reason: string;
}> {
  const weak = getWeakConcepts(concepts);
  const suggestions: Array<{
    conceptId: string;
    conceptName: string;
    suggestedExercises: string[];
    reason: string;
  }> = [];

  const reasonMap: Record<string, string> = {
    'ipv4-basics': 'Pratique o ipconfig e verifique endereçamento IPv4',
    'subnet-mask': 'Exercícios de máscara de sub-rede e cálculo de redes',
    'gateway': 'Configure gateways e teste conectividade entre redes',
    'routing-basics': 'Pratique roteamento estático com laboratórios de cadeia de roteadores',
    'arp': 'Reveja a resolução ARP com exercícios de tabela ARP',
    'broadcast': 'Exercícios de broadcast e comunicação na mesma sub-rede',
    'dhcp': 'Configure e diagnostique servidores DHCP',
    'dns': 'Resolva nomes com nslookup e diagnostique DNS',
  };

  for (const c of weak) {
    const exercises: string[] = [`Lab de ${c.name.toLowerCase()}`];
    const reason = reasonMap[c.conceptId] || 'Revisar conceitos básicos';
    suggestions.push({
      conceptId: c.conceptId,
      conceptName: c.name,
      suggestedExercises: exercises,
      reason,
    });
  }

  return suggestions;
}

export { getWeakConcepts, getDueForReview, getReinforcementSuggestions };
export type { ConceptProgress } from '../stores/useProgressStore';