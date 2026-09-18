import type { Topology } from '../types';

export interface WizardCheckResult {
  passed: boolean;
  detail?: string;
}

export interface WizardStep {
  id: string;
  title: string;
  description: string;
  hint?: string;
  check: (topology: Topology) => WizardCheckResult;
}

export interface WizardScenario {
  id: string;
  title: string;
  description: string;
  base: () => Topology;
  steps: WizardStep[];
}

export function evaluateStep(topology: Topology, step: WizardStep): WizardCheckResult {
  return step.check(topology);
}