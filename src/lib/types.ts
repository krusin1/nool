// Shared types for client and server.

export interface Project {
	id: string;
	title: string;
	description: string;
	created_at: string;
	updated_at: string;
	/** Set when the project is posted as a case study. Null while it is mint. */
	posted_at: string | null;
}

export interface Stage {
	id: string;
	project_id: string;
	name: string;
	position: number;
}

export interface SpreadItem {
	id: string;
	kind: 'image' | 'note' | 'quote' | 'swatch' | 'label';
	content: string; // text, image src, or comma-separated hex colors
	caption: string;
	x: number; // percent of spread width
	y: number; // percent of spread height
	w: number; // percent of spread width
	rotate: number;
	z: number;
	tape: boolean;
}

export interface BlockDataMap {
	note: { text: string };
	image: { src: string; caption: string };
	link: { url: string; note: string };
	quote: { text: string; cite: string };
	todo: { items: { text: string; done: boolean }[] };
	palette: { colors: string[] };
	spread: { items: SpreadItem[] };
}

export type BlockType = keyof BlockDataMap;

interface BlockBase {
	id: string;
	project_id: string;
	stage_id: string;
	position: number;
	/** Where the block came from: 'desk' when added in the app, otherwise the sending app. */
	source: string;
	created_at: string;
	updated_at: string;
}

export type Block = {
	[T in BlockType]: BlockBase & { type: T; data: BlockDataMap[T] };
}[BlockType];

export type SourceId = 'met' | 'cooperhewitt' | 'semanticscholar' | 'arxiv' | 'github' | 'web';

export interface Precedent {
	id: string;
	project_id: string;
	stage_id: string;
	source: SourceId;
	title: string;
	creator: string;
	year: string;
	url: string;
	image_url: string | null;
	snippet: string;
	kept: boolean;
	note: string;
	created_at: string;
}

export interface ProjectSummary {
	project: Project;
	blockCount: number;
	stageCount: number;
	filledStages: number;
	cover: string | null;
}

export type HomeView = 'stamps' | 'list';
export type Tab = 'blocks' | 'precedents';
