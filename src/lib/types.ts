export type StageId = 'spark' | 'research' | 'experiments' | 'build' | 'outcome';

export type EntryType = 'text' | 'image' | 'link' | 'voice';

export type SourceId = 'met' | 'cooperhewitt' | 'semanticscholar' | 'arxiv' | 'github';

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
