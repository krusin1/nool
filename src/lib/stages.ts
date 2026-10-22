import type { SourceId, StageId } from './types.ts';

export interface Stage {
	id: StageId;
	label: string;
	hint: string;
}

export const STAGES: Stage[] = [
	{ id: 'spark', label: 'Spark', hint: 'The idea, the itch, the first image.' },
	{ id: 'research', label: 'Research', hint: 'Reading, references, theory.' },
	{ id: 'experiments', label: 'Experiments', hint: 'Tests, prototypes, dead ends.' },
	{ id: 'build', label: 'Build', hint: 'Making the real thing.' },
	{ id: 'outcome', label: 'Outcome', hint: 'What it became, and where it sits.' }
];

export const SOURCE_LABELS: Record<SourceId, string> = {
	met: 'The Met',
	cooperhewitt: 'Cooper Hewitt',
	semanticscholar: 'Semantic Scholar',
	arxiv: 'arXiv',
	github: 'GitHub',
	web: 'Web'
};

export function stageLabel(id: StageId): string {
	return STAGES.find((s) => s.id === id)?.label ?? id;
}

export function formatDate(iso: string): string {
	return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
