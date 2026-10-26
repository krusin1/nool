import type { BlockType } from './types.ts';

// Starting stages for a new project. Every name can be changed later, and stages
// can be added, removed or reordered on the desk.
export interface Template {
	id: string;
	label: string;
	hint: string;
	stages: { name: string; starter?: BlockType }[];
}

export const TEMPLATES: Template[] = [
	{
		id: 'studio',
		label: 'Studio',
		hint: 'Six stages from first spark to outcome, with a moodboard spread.',
		stages: [
			{ name: 'Spark' },
			{ name: 'Moodboard', starter: 'spread' },
			{ name: 'Research' },
			{ name: 'Experiments' },
			{ name: 'Build' },
			{ name: 'Outcome' }
		]
	},
	{
		id: 'simple',
		label: 'Simple',
		hint: 'Idea, making, result.',
		stages: [{ name: 'Idea' }, { name: 'Making' }, { name: 'Result' }]
	},
	{
		id: 'blank',
		label: 'Blank',
		hint: 'One stage. Add your own as you go.',
		stages: [{ name: 'Notes' }]
	}
];
