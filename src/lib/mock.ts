// Phase 1 mock data. Replaced by SQLite + live sources in later phases.
// Precedents are real works and papers; URLs point to source searches until the
// live fetchers (Phase 4) supply canonical links.
import type { BoardItem, Entry, Precedent, Project } from './types.ts';
import * as caseStudy from './mock-case-study.ts';

const PID = 'tidal';

const tidalProjects: Project[] = [
	{
		id: PID,
		title: 'Tidal',
		description: 'A wall of light that slows its pulse to match the breathing of the people in front of it.',
		created_at: '2026-09-08T14:00:00Z',
		published: false
	}
];

const tidalEntries: Entry[] = [
	// Spark
	{
		id: 'e1',
		project_id: PID,
		stage: 'spark',
		type: 'text',
		raw_content:
			'Sat on the subway platform at 1am and noticed the whole car exhale at once when the doors opened. What if a room could notice that? Not respond loudly. Just breathe back.',
		file_path: null,
		ai_summary: 'A late-night subway moment: a crowd exhaling together, and the idea of a room that quietly breathes back.',
		created_at: '2026-09-08T14:10:00Z'
	},
	{
		id: 'e2',
		project_id: PID,
		stage: 'spark',
		type: 'image',
		raw_content: 'First sketch. Wall of light, two people, the waves slow down when they slow down.',
		file_path: '/mock/sketch-wall.svg',
		ai_summary: 'First sketch of a 3m light wall whose waves slow as the two people in front of it slow their breathing.',
		created_at: '2026-09-09T10:30:00Z'
	},
	// Research
	{
		id: 'e3',
		project_id: PID,
		stage: 'research',
		type: 'link',
		raw_content: 'https://en.wikipedia.org/wiki/Calm_technology',
		file_path: null,
		ai_summary: 'Calm technology as a frame: information that lives at the periphery and moves to the centre only when needed.',
		created_at: '2026-09-12T16:00:00Z'
	},
	{
		id: 'e4',
		project_id: PID,
		stage: 'research',
		type: 'text',
		raw_content:
			'Resting breathing rate is roughly 12 to 20 breaths per minute. Slow-paced breathing guides usually target about 6. The wall should never lead faster than the slowest person in the room.',
		file_path: null,
		ai_summary: 'Resting breath sits around 12 to 20 per minute; the wall should follow the slowest person, never push faster.',
		created_at: '2026-09-14T11:20:00Z'
	},
	// Experiments
	{
		id: 'e5',
		project_id: PID,
		stage: 'experiments',
		type: 'image',
		raw_content: 'Chest strap vs. 60GHz mmWave radar at 1.5m. Radar lags by about half a breath but no wearable needed.',
		file_path: '/mock/breath-graph.svg',
		ai_summary: 'Compared a chest strap with mmWave radar at 1.5m: radar lags by about half a breath but removes the wearable.',
		created_at: '2026-09-20T19:45:00Z'
	},
	{
		id: 'e6',
		project_id: PID,
		stage: 'experiments',
		type: 'voice',
		raw_content:
			'Voice note: tried the webcam approach with pose tracking on shoulders. Works when people stand still, falls apart the second anyone talks or turns. Parking it.',
		file_path: null,
		ai_summary: 'Webcam shoulder tracking worked only when people stood still; parked because talking or turning broke it.',
		created_at: '2026-09-22T22:05:00Z'
	},
	{
		id: 'e7',
		project_id: PID,
		stage: 'experiments',
		type: 'text',
		raw_content:
			'Easing matters more than accuracy. A linear map from breath rate to wave speed feels mechanical. A 4 second smoothing window makes it feel like it is listening.',
		file_path: null,
		ai_summary: 'Smoothing over 4 seconds made the wall feel attentive; a direct linear mapping felt mechanical.',
		created_at: '2026-09-25T13:00:00Z'
	},
	// Build
	{
		id: 'e8',
		project_id: PID,
		stage: 'build',
		type: 'text',
		raw_content:
			'Final rig: 6 strips of WS2812B behind a frosted acrylic diffuser, ESP32 running FastLED, radar over serial. Teensy was overkill.',
		file_path: null,
		ai_summary: 'Built with six WS2812B strips behind frosted acrylic, driven by an ESP32 on FastLED with radar over serial.',
		created_at: '2026-10-03T15:30:00Z'
	},
	{
		id: 'e9',
		project_id: PID,
		stage: 'build',
		type: 'link',
		raw_content: 'https://github.com/FastLED/FastLED',
		file_path: null,
		ai_summary: 'FastLED handles the LED timing so the ESP32 can spend its cycles on breath detection.',
		created_at: '2026-10-04T09:10:00Z'
	},
	// Outcome
	{
		id: 'e10',
		project_id: PID,
		stage: 'outcome',
		type: 'image',
		raw_content: 'Installed at the thesis show. People stayed longer than I expected. A few closed their eyes.',
		file_path: '/mock/installation.svg',
		ai_summary: 'Installed at the thesis show, where visitors lingered and some closed their eyes.',
		created_at: '2026-10-15T20:00:00Z'
	},
	{
		id: 'e11',
		project_id: PID,
		stage: 'outcome',
		type: 'text',
		raw_content:
			'What I would change: the wall cannot tell two people apart, so it averages them. Next version should hold two rhythms at once and let them drift together.',
		file_path: null,
		ai_summary: 'The wall averages everyone into one rhythm; next, it should hold two and let them drift together.',
		created_at: '2026-10-17T10:00:00Z'
	}
];

const tidalPrecedents: Precedent[] = [
	// Spark
	{
		id: 'p1',
		project_id: PID,
		stage: 'spark',
		source: 'met',
		title: 'Under the Wave off Kanagawa (Kanagawa oki nami ura)',
		creator: 'Katsushika Hokusai',
		year: 'ca. 1830–32',
		url: 'https://www.metmuseum.org/art/collection/search?q=Hokusai+Great+Wave',
		image_url: null,
		snippet: 'A single held moment of a rhythmic force, close to your idea of a pulse the viewer can feel but not control.',
		kept: true,
		note: 'The suspended crest is the feeling I want at the top of each breath.'
	},
	{
		id: 'p2',
		project_id: PID,
		stage: 'spark',
		source: 'semanticscholar',
		title: 'Ambient Displays: Turning Architectural Space into an Interface between People and Digital Information',
		creator: 'Wisneski, Ishii, Dahley, Gorbet, Brave, Ullmer, Yarin',
		year: '1998',
		url: 'https://www.semanticscholar.org/search?q=Ambient%20Displays%20Turning%20Architectural%20Space',
		image_url: null,
		snippet: 'Treats walls and light as quiet information surfaces, the same register as a room that breathes back.',
		kept: false,
		note: ''
	},
	// Research
	{
		id: 'p3',
		project_id: PID,
		stage: 'research',
		source: 'semanticscholar',
		title: 'Designing Calm Technology',
		creator: 'Mark Weiser, John Seely Brown',
		year: '1996',
		url: 'https://www.semanticscholar.org/search?q=Designing%20Calm%20Technology',
		image_url: null,
		snippet: 'The source text for the periphery-to-centre idea in your calm technology note.',
		kept: true,
		note: 'Core framing for the wall staying in the periphery.'
	},
	{
		id: 'p4',
		project_id: PID,
		stage: 'research',
		source: 'semanticscholar',
		title: 'Tangible Bits: Towards Seamless Interfaces between People, Bits and Atoms',
		creator: 'Hiroshi Ishii, Brygg Ullmer',
		year: '1997',
		url: 'https://www.semanticscholar.org/search?q=Tangible%20Bits%20Ishii%20Ullmer',
		image_url: null,
		snippet: 'Introduces ambient media as background awareness, relevant to light that responds without asking for attention.',
		kept: false,
		note: ''
	},
	// Experiments
	{
		id: 'p5',
		project_id: PID,
		stage: 'experiments',
		source: 'arxiv',
		title: 'MediaPipe: A Framework for Building Perception Pipelines',
		creator: 'Lugaresi et al.',
		year: '2019',
		url: 'https://arxiv.org/search/?query=MediaPipe+Framework+Perception+Pipelines&searchtype=all',
		image_url: null,
		snippet: 'The pose-tracking stack behind your parked webcam test; useful if you revisit camera-based sensing.',
		kept: false,
		note: ''
	},
	{
		id: 'p6',
		project_id: PID,
		stage: 'experiments',
		source: 'github',
		title: 'google-ai-edge/mediapipe',
		creator: 'Google AI Edge',
		year: '2019',
		url: 'https://github.com/google-ai-edge/mediapipe',
		image_url: null,
		snippet: 'Reference implementation for shoulder and torso landmarks used in breath estimation from video.',
		kept: false,
		note: ''
	},
	// Build
	{
		id: 'p7',
		project_id: PID,
		stage: 'build',
		source: 'github',
		title: 'FastLED/FastLED',
		creator: 'FastLED',
		year: '2013',
		url: 'https://github.com/FastLED/FastLED',
		image_url: null,
		snippet: 'The LED library in your rig. Its built-in easing and blending helpers can replace hand-rolled smoothing.',
		kept: true,
		note: 'Used for all LED output.'
	},
	{
		id: 'p8',
		project_id: PID,
		stage: 'build',
		source: 'github',
		title: 'processing/p5.js',
		creator: 'Processing Foundation',
		year: '2014',
		url: 'https://github.com/processing/p5.js',
		image_url: null,
		snippet: 'Quick way to prototype wave behaviour on screen before flashing changes to the ESP32.',
		kept: false,
		note: ''
	},
	// Outcome
	{
		id: 'p9',
		project_id: PID,
		stage: 'outcome',
		source: 'semanticscholar',
		title: 'Ambient Displays: Turning Architectural Space into an Interface between People and Digital Information',
		creator: 'Wisneski et al.',
		year: '1998',
		url: 'https://www.semanticscholar.org/search?q=Ambient%20Displays%20Turning%20Architectural%20Space',
		image_url: null,
		snippet: 'Closest academic precedent for positioning: architectural light as ambient, bodily information.',
		kept: false,
		note: ''
	}
];

// A project with no images yet, to show the default stamp.
const softProjects: Project[] = [
	{
		id: 'soft-machines',
		title: 'Soft Machines',
		description: 'Knitted sensors that notice how they are being held.',
		created_at: '2026-10-19T12:00:00Z',
		published: false
	}
];
const softEntries: Entry[] = [
	{
		id: 'sm1',
		project_id: 'soft-machines',
		stage: 'spark',
		type: 'text',
		raw_content: 'Conductive yarn changes resistance when stretched. What if a scarf could tell a hug from a tug?',
		file_path: null,
		ai_summary: 'Conductive yarn changes resistance when stretched, so a knitted piece might tell a hug from a tug.',
		created_at: '2026-10-19T12:10:00Z'
	}
];

export const projects: Project[] = [...caseStudy.projects, ...tidalProjects, ...softProjects];
export const entries: Entry[] = [...caseStudy.entries, ...tidalEntries, ...softEntries];
export const board: BoardItem[] = [...caseStudy.board];
export const precedents: Precedent[] = [...caseStudy.precedents, ...tidalPrecedents];

export function getProject(id: string) {
	const project = projects.find((p) => p.id === id);
	if (!project) return null;
	return {
		project,
		entries: entries.filter((e) => e.project_id === id),
		board: board.filter((b) => b.project_id === id),
		precedents: precedents.filter((p) => p.project_id === id)
	};
}
