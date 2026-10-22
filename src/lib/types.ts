export type StageId = 'spark' | 'moodboard' | 'research' | 'experiments' | 'build' | 'outcome';

export type EntryType = 'text' | 'image' | 'link' | 'voice';

// 'web' covers precedents a maker adds by hand (sites, products, archives).
export type SourceId = 'met' | 'cooperhewitt' | 'semanticscholar' | 'arxiv' | 'github' | 'web';

export interface Project {
	id: string;
	title: string;
	description: string;
	created_at: string;
	published: boolean;
}

export interface Entry {
	id: string;
	project_id: string;
	stage: StageId;
	type: EntryType;
	raw_content: string;
	file_path: string | null;
	ai_summary: string;
	created_at: string;
}

export interface Precedent {
	id: string;
	project_id: string;
	stage: StageId;
	source: SourceId;
	title: string;
	creator: string;
	year: string;
	url: string;
	image_url: string | null;
	snippet: string;
	kept: boolean;
	note: string;
}

export type Tab = 'entries' | 'precedents';

// Moodboard: items collaged on a two-page book spread. Positions are percentages
// of the spread (x, y from top-left; w of spread width) so it scales to any size.
export type BoardKind = 'image' | 'note' | 'quote' | 'swatch' | 'label';

export interface BoardItem {
	id: string;
	project_id: string;
	kind: BoardKind;
	content: string; // text, image path, or comma-separated hex colors for swatches
	caption: string;
	x: number;
	y: number;
	w: number;
	rotate: number;
	z: number;
	tape: boolean;
}

export type HomeView = 'stamps' | 'list';
