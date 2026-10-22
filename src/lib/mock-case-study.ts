// The app's own case study, documented in the app. Mock data until Phase 2.
// Research entries cite real, checked sources. Nothing here reports user testing
// that has not happened yet; the Outcome stage lists it as the next step.
import type { BoardItem, Entry, Precedent, Project } from './types.ts';

const PID = 'marginalia';

const at = (day: number, hh: number, mm = 0) =>
	`2026-10-${String(day).padStart(2, '0')}T${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}:00Z`;

export const projects: Project[] = [
	{
		id: PID,
		title: 'Nool',
		description:
			'A process log for makers that finds what their work builds on, while they are still making it.',
		created_at: at(21, 13),
		published: true
	}
];

let n = 0;
const entry = (
	stage: Entry['stage'],
	type: Entry['type'],
	created_at: string,
	raw_content: string,
	ai_summary: string,
	file_path: string | null = null
): Entry => ({ id: `cs-e${++n}`, project_id: PID, stage, type, raw_content, file_path, ai_summary, created_at });

export const entries: Entry[] = [
	// Spark: the problem
	entry(
		'spark',
		'text',
		at(21, 13, 10),
		'The best thinking in a project happens in the middle. The test that failed, the reference that changed direction, the reason one material won. By the end most of it is gone, and the case study gets rebuilt from memory and a camera roll.',
		'The most important thinking in a project happens in the middle, and by the end most of it is gone. Case studies get rebuilt from memory and a camera roll.'
	),
	entry(
		'spark',
		'text',
		at(21, 13, 25),
		'Two questions every maker gets asked: how did you get here, and what is this in conversation with? Portfolios answer the first one badly and the second one almost never.',
		'Every maker gets asked how they got here and what the work is in conversation with. Portfolios answer the first badly and the second almost never.'
	),
	entry(
		'spark',
		'text',
		at(21, 13, 40),
		'Ground rule: AI connects and documents. People make. The AI never generates the creative work itself.',
		'One rule from the start: the AI connects and documents, people make, and the AI never generates the work itself.'
	),

	// Research: evidence
	entry(
		'research',
		'link',
		at(22, 14, 5),
		'https://media.mit.edu/publications/documentation-in-progress-challenges-with-representing-design-process-online',
		'When student teams documented a three-week project on Build in Progress, they treated it as instructions for recreating the result and left out experimentation and mistakes (Tseng, Yang and Ruthmann). Tools have to make the messy middle worth keeping.'
	),
	entry(
		'research',
		'link',
		at(22, 14, 20),
		'https://www.media.mit.edu/publications/product-versus-process-representing-and-appropriating-diy-projects-online/',
		'Interviews and surveys with Instructables authors and readers found that the people writing documentation and the people using it want different things from it (Tseng and Resnick). A process log and a published page should be two views of the same material.'
	),
	entry(
		'research',
		'link',
		at(22, 14, 35),
		'https://userinterfaces.aalto.fi/inspiration-in-design/resources/DRS%202018%20final.pdf',
		'A survey of 51 professional designers found the internet is now a main source of ideas, but online examples arrive without documented reasoning, so designers struggle to trust them (Koch, László, Lucero and Oulasvirta). Work published with its process and lineage is exactly what that gap is missing.'
	),
	entry(
		'research',
		'text',
		at(22, 14, 50),
		'Herring et al. (CHI 2009) found designers keep personal collections of examples for later. Koch et al. note these collections grow unmanageable, feel ineffective and go stale.',
		'Designers keep personal collections of examples that grow unmanageable and go stale. Precedents should be attached to the stage of a project they informed, not kept in a separate pile.'
	),
	entry(
		'research',
		'text',
		at(22, 15, 5),
		'Schön, The Reflective Practitioner (1983): practitioners think through doing, and reflection in action is where professional knowledge forms. Documentation after the fact misses it.',
		'Schön argues that practitioners know through doing and reflect in the middle of the action. That is the case for logging during the project instead of after it.'
	),
	entry(
		'research',
		'text',
		at(22, 15, 20),
		'Jansson and Smith (Design Studies, 1991) showed that seeing an example can make designers reproduce its features, including its flaws. Design fixation is the main risk of a precedent finder.',
		'Examples can cause design fixation, where designers copy what they have seen. Precedents should arrive after the maker’s own entries, framed as context with a line on why they relate, never as solutions.'
	),

	// Experiments: concept decisions
	entry(
		'experiments',
		'image',
		at(22, 15, 40),
		'Positioning map. Horizontal: captures the finished product vs. captures the process. Vertical: your own work only vs. connects it to other work.',
		'Mapped the field on two axes. Process tools stay inside your own work, reference tools never touch it, and the top right corner is empty.',
		'/mock/case/positioning-map.svg'
	),
	entry(
		'experiments',
		'text',
		at(22, 15, 55),
		'Fixed five stages: spark, research, experiments, build, outcome. Each one asks the precedent finder for something different: artworks and installations at spark, papers at research, technical approaches at experiments, code and tools at build, closest prior works at outcome.',
		'Five fixed stages, each asking for a different kind of precedent: artworks at spark, papers at research, technical approaches at experiments, code at build and the closest prior work at outcome.'
	),
	entry(
		'experiments',
		'text',
		at(22, 16, 10),
		'Positioning v1: "a process documentation platform with an AI precedent finder." Lists features and sounds like homework. Nobody wants to document; people want credit for their thinking and to know their idea is not already done. v2: "Show what your work builds on."',
		'The first positioning listed features and sounded like homework. The second leads with the payoff: show what your work builds on.'
	),
	entry(
		'experiments',
		'text',
		at(22, 16, 25),
		'Working name Marginalia was too long to say out loud. Shortlisted one and two syllable names, including names from Indian languages. Going with Nool for now: Tamil for thread, and also for book.',
		'Marginalia was too long to say. Renamed Nool for now, Tamil for both thread and book: the thread of a process that becomes a record.'
	),

	// Build: prototype
	entry(
		'build',
		'image',
		at(22, 16, 45),
		'Phase 1 workspace. Stage rail on the left, entries in the center, precedents for the current stage on the right.',
		'The Phase 1 workspace: stages on the left, entries in the center and precedents for the current stage on the right, so the reading list sits next to the work.',
		'/mock/case/workspace.png'
	),
	entry(
		'build',
		'image',
		at(22, 17, 0),
		'The loop the prototype has to demonstrate end to end: create, log, structure, find precedents, keep, publish.',
		'One loop has to work end to end: create a project, log entries, let AI structure them, surface precedents, keep the useful ones and publish.',
		'/mock/case/loop.svg'
	),
	entry(
		'build',
		'text',
		at(22, 17, 15),
		'Precedent pipeline: Claude writes 3 to 5 queries for the current stage from the title, description and entries. Queries run against Semantic Scholar, arXiv, The Met, Cooper Hewitt and GitHub. Results are deduped, Claude ranks the top 8 and writes one line on why each is relevant. Cached per stage, refreshed on demand.',
		'Claude writes the search queries and ranks the results, but every precedent is a real record from a public collection or index. It never invents one.'
	),
	entry(
		'build',
		'text',
		at(22, 17, 30),
		'Stack: SvelteKit with Svelte 5, plain CSS custom properties, SQLite for local persistence, Anthropic API on the server only. Editorial type: Inter for interface, Newsreader for titles and published pages.',
		'Built in SvelteKit with plain CSS and SQLite, with all AI and source calls on the server. The look is a print journal, not a dashboard.'
	),

	// Outcome: position and next steps
	entry(
		'outcome',
		'image',
		at(22, 17, 50),
		'Identity: a perforated stamp with one thread that writes an n. Every project on the home page becomes its own stamp.',
		'The Nool mark is one thread writing an n inside a stamp. Every project becomes a stamp: mint while in progress, postmarked when published.',
		'/mock/case/nool-cover.svg'
	),
	entry(
		'outcome',
		'text',
		at(22, 18, 0),
		'Where it sits: Hackaday.io and Build in Progress log process. Are.na collects references. Behance publishes the result. ResearchRabbit and Connected Papers map related papers. None connect a live process log to precedent across art, design and code.',
		'Other tools log process, collect references, publish results or map papers. This is the first to connect a live process log to precedent across art, design and code.'
	),
	entry(
		'outcome',
		'text',
		at(22, 18, 15),
		'Biggest risk is adoption, not technology. If logging takes more than ten seconds, people stop around week two. Mobile and voice capture come before anything else after the prototype.',
		'The risk is adoption, not technology. If logging takes more than ten seconds people stop, so mobile and voice capture come next.'
	),
	entry(
		'outcome',
		'text',
		at(22, 18, 30),
		'First market: thesis students and MFA programs. Required to document process and cite precedent, working to a deadline, and the school can pay.',
		'The first audience is thesis students, who already have to document process and cite precedent, on a deadline.'
	),
	entry(
		'outcome',
		'text',
		at(22, 18, 45),
		'Next: 5 to 10 makers use the prototype on a real project for 2 to 3 weeks. Two measures: do they keep logging, and do they keep any precedents.',
		'Next, five to ten makers use it on real projects for two to three weeks. The test is simple: do they keep logging, and do they keep any precedents.'
	)
];

let m = 0;
const precedent = (
	stage: Precedent['stage'],
	source: Precedent['source'],
	title: string,
	creator: string,
	year: string,
	url: string,
	snippet: string,
	note = '',
	kept = true
): Precedent => ({
	id: `cs-p${++m}`,
	project_id: PID,
	stage,
	source,
	title,
	creator,
	year,
	url,
	image_url: null,
	snippet,
	kept,
	note
});

const ss = (q: string) => `https://www.semanticscholar.org/search?q=${encodeURIComponent(q)}`;

export const precedents: Precedent[] = [
	// Spark
	precedent(
		'spark',
		'web',
		'As We May Think',
		'Vannevar Bush',
		'1945',
		'https://www.theatlantic.com/magazine/archive/1945/07/as-we-may-think/303881/',
		'The Memex links documents through associative trails, the earliest version of tying a piece of work to what it draws on.',
		'The original lineage machine. Trails, not folders.'
	),
	precedent(
		'moodboard',
		'web',
		'Mnemosyne Atlas',
		'Aby Warburg',
		'1924–29',
		'https://warburg.sas.ac.uk/',
		'Panels of images arranged to show how visual ideas travel across centuries.',
		'A lineage you can see at a glance. The published page should feel like one panel.'
	),

	// Research
	precedent(
		'research',
		'semanticscholar',
		'The Reflective Practitioner: How Professionals Think in Action',
		'Donald A. Schön',
		'1983',
		ss('The Reflective Practitioner Schön'),
		'Reflection in action as the core of professional knowledge.',
		'Why logging has to happen during the work.'
	),
	precedent(
		'research',
		'web',
		'Documentation in Progress: Challenges with Representing Design Process Online',
		'Tiffany Tseng, Maria Yang, Alex Ruthmann',
		'MIT Media Lab',
		'https://media.mit.edu/publications/documentation-in-progress-challenges-with-representing-design-process-online',
		'Students left experimentation and mistakes out of their process documentation.',
		'The clearest evidence for the problem.'
	),
	precedent(
		'research',
		'web',
		'Product versus Process: Representing and Appropriating DIY Projects Online',
		'Tiffany Tseng, Mitchel Resnick',
		'DIS 2014',
		'https://www.media.mit.edu/publications/product-versus-process-representing-and-appropriating-diy-projects-online/',
		'Authors and readers of DIY documentation want different things from it.',
		'Log and published page as two views of one record.'
	),
	precedent(
		'research',
		'web',
		'Surfing for Inspiration: Digital Inspirational Material in Design Practice',
		'Janin Koch, Magda László, Andrés Lucero, Antti Oulasvirta',
		'2017',
		'https://userinterfaces.aalto.fi/inspiration-in-design/resources/DRS%202018%20final.pdf',
		'Online examples lack documented reasoning, so designers find them hard to trust.',
		'The gap a published lineage fills.'
	),
	precedent(
		'research',
		'semanticscholar',
		'Getting Inspired! Understanding How and Why Examples Are Used in Creative Design Practice',
		'Scarlett R. Herring, Chia-Chen Chang, Jesse Krantzler, Brian P. Bailey',
		'2009',
		ss('Getting inspired understanding how and why examples are used in creative design practice'),
		'Designers collect examples for later use in personal libraries.',
		'Collections without context go stale.'
	),
	precedent(
		'research',
		'semanticscholar',
		'Design Fixation',
		'David G. Jansson, Steven M. Smith',
		'1991',
		ss('Design fixation Jansson Smith'),
		'Exposure to examples can lead designers to reproduce their features.',
		'The risk to design against. Precedents as context, never answers.'
	),
	precedent(
		'research',
		'semanticscholar',
		'Annotated Portfolios',
		'Bill Gaver, John Bowers',
		'2012',
		ss('Annotated portfolios Gaver Bowers'),
		'Designed artefacts with annotations as a form of design knowledge.',
		'What the published page is, academically.'
	),

	// Experiments
	precedent(
		'experiments',
		'web',
		'Build in Progress',
		'Tiffany Tseng, MIT Media Lab',
		'Research platform',
		'https://www.media.mit.edu/projects/build-in-progress/overview/',
		'A platform for sharing the story of a design process as it happens.',
		'Closest direct precedent. Process first, but no link to outside work.'
	),
	precedent(
		'experiments',
		'web',
		'Hackaday.io project logs',
		'Hackaday',
		'Online platform',
		'https://hackaday.io/',
		'Hardware projects documented as dated build logs.',
		'The log format makers already accept.'
	),
	precedent(
		'experiments',
		'web',
		'Are.na',
		'Are.na',
		'Online platform',
		'https://www.are.na/',
		'Collecting and connecting references, widely used by designers.',
		'The reference side done well, with no project log.'
	),
	precedent(
		'experiments',
		'web',
		'Behance',
		'Adobe',
		'Online platform',
		'https://www.behance.net/',
		'Polished project case studies built by hand after the work is done.',
		'',
		false
	),

	// Build
	precedent(
		'build',
		'web',
		'ResearchRabbit',
		'ResearchRabbit',
		'Online tool',
		'https://www.researchrabbit.ai/',
		'Maps papers related to the ones you give it.',
		'Same move as the precedent finder, academic only.'
	),
	precedent(
		'build',
		'github',
		'sveltejs/kit',
		'Svelte',
		'Open source',
		'https://github.com/sveltejs/kit',
		'The framework the prototype is built on.',
		'',
		false
	),

	// Outcome
	precedent(
		'outcome',
		'semanticscholar',
		'Research through Design as a Method for Interaction Design Research in HCI',
		'John Zimmerman, Jodi Forlizzi, Shelley Evenson',
		'2007',
		ss('Research through design as a method for interaction design research in HCI'),
		'Frames the process of making as a form of research.',
		'The argument for schools and labs.'
	)
];

let b = 0;
const item = (kind: BoardItem['kind'], content: string, x: number, y: number, w: number, rotate = 0, extra: Partial<BoardItem> = {}): BoardItem => ({
	id: `cs-b${++b}`,
	project_id: PID,
	kind,
	content,
	caption: '',
	x,
	y,
	w,
	rotate,
	z: b,
	tape: false,
	...extra
});

// One spread: left page is identity and feel, right page is reading and layout.
export const board: BoardItem[] = [
	item('label', 'Moodboard · Identity', 4, 5, 22),
	item('image', '/mock/case/board/stamp-study.svg', 4, 13, 30, -2, { tape: true, caption: 'Every project is a stamp' }),
	item('quote', 'Nool: Tamil for thread, and also for book.', 6, 66, 24, 0),
	item('swatch', '#2B4BFF,#F3EFE6,#111111,#D2462B', 31, 72, 16, 2),
	item('image', '/mock/case/board/thread.svg', 36, 10, 12, 4, { tape: true }),
	item('note', 'Mint while you work. Postmarked when you publish.', 36, 42, 11, -3),
	item('label', 'Reading · Layout', 54, 5, 20),
	item('image', '/mock/case/board/layout-sketch.svg', 54, 12, 26, 1, { caption: 'Margin notes carry the lineage' }),
	item('image', '/mock/case/board/postmark.svg', 76, 50, 20, -6, { tape: true }),
	item('note', 'All grotesk. Space Grotesk for titles, Hanken Grotesk to read.', 56, 64, 15, 2),
	item('quote', 'AI connects and documents. People make.', 81, 14, 17, 0)
];
