// Nool site. Small, quiet interactions; everything reads fine without them.
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();

// Perforated edge for every stamp (CSS mask), and the holes in the logo.
(() => {
	const W = 200, H = 250, r = 6, step = 12.5;
	let holes = '';
	for (let x = 0; x <= W; x += step) holes += `<circle cx="${x}" cy="0" r="${r}"/><circle cx="${x}" cy="${H}" r="${r}"/>`;
	for (let y = 0; y <= H; y += step) holes += `<circle cx="0" cy="${y}" r="${r}"/><circle cx="${W}" cy="${y}" r="${r}"/>`;
	const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none"><defs><mask id="m"><rect width="${W}" height="${H}" fill="white"/><g fill="black">${holes}</g></mask></defs><rect width="${W}" height="${H}" fill="black" mask="url(#m)"/></svg>`;
	document.documentElement.style.setProperty('--perf', `url("data:image/svg+xml,${encodeURIComponent(svg)}")`);
	const g = $('#logo-holes');
	if (g) for (let i = 6; i <= 26; i += 4) for (const [x, y] of [[i, 2], [i, 30], [2, i], [30, i]]) g.insertAdjacentHTML('beforeend', `<circle cx="${x}" cy="${y}" r="1.7"/>`);
})();

// Fade sections in as they arrive.
const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && (e.target.classList.add('in'), io.unobserve(e.target))), { rootMargin: '0px 0px -8% 0px' });
const watch = () => $$('.reveal:not(.in)').forEach((el) => io.observe(el));

const POSTMARK = `<svg class="postmark" viewBox="0 0 220 100" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="2.6"><circle cx="52" cy="50" r="40"/><circle cx="52" cy="50" r="31" stroke-width="1.2"/>${[30, 43, 56, 69].map((y) => `<path d="M100 ${y} q12 -7 24 0 t24 0 t24 0 t24 0 t24 0"/>`).join('')}</g><g fill="currentColor" font-family="Hanken Grotesk, sans-serif" font-weight="600" text-anchor="middle"><text x="52" y="46" font-size="10" letter-spacing="1">POSTED</text><text x="52" y="60" font-size="8">${today}</text></g></svg>`;

// ---------- hero stamp: tap to post, tap again to recall ----------
(() => {
	const s = $('#hero-stamp');
	if (!s) return;
	$('#pm-date').textContent = today;
	const hint = $('.stamp-hint');
	s.addEventListener('click', () => {
		const on = s.classList.toggle('posted');
		s.setAttribute('aria-label', on ? 'Recall this stamp' : 'Post this stamp');
		if (on && !reduce) {
			s.classList.remove('thud');
			void s.offsetWidth;
			s.classList.add('thud');
		}
		if (hint) hint.textContent = on ? 'posted. tap again to recall' : 'tap the stamp to post it';
	});
})();

// ---------- the sheet of stamps ----------
(() => {
	const sheet = $('#sheet');
	if (!sheet) return;
	const icon = (d) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
	const F = [
		['Capture in one keystroke', 'Type and press Enter. Paste a link, drop an image.', '#2B4BFF', '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13 7l4 4"/>', 'desk'],
		['Voice notes', 'Talk it through on the desk; transcribe it if you want.', '#1F3D2B', '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>', 'voice'],
		['Moodboard spreads', 'Collage images, notes and colours like a book page.', '#C2410C', '<rect x="3" y="4" width="18" height="16"/><path d="M12 4v16M6 8h3M6 11h3M15 9h3v5h-3z"/>', 'blocks'],
		['Precedents', 'Find works in museums, papers and code. Keep what matters.', '#7A4FB8', '<circle cx="11" cy="11" r="6"/><path d="M20 20l-4.5-4.5"/>', 'precedents'],
		['Post it as a letter', 'Your project becomes an editorial case study.', '#D93A2B', '<rect x="3" y="6" width="18" height="13"/><path d="M3 7l9 6 9-6"/>', 'post'],
		['Share anywhere', 'A web page, a website folder, or a PDF.', '#0F766E', '<path d="M12 3v12M7 8l5-5 5 5"/><path d="M5 14v6h14v-6"/>', 'share'],
		['From Figma, Claude, your phone', 'Work arrives where it belongs, marked with where it came from.', '#2B4BFF', '<path d="M4 12h10M10 6l6 6-6 6"/><path d="M20 4v16"/>', 'figma'],
		['Yours, on your computer', 'No account, no server. Back up to a file or your Drive.', '#14151A', '<rect x="4" y="11" width="16" height="10"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>', 'data']
	];
	const tilt = [-3, 2, -1.5, 3, -2, 1.5, -2.5, 2];
	sheet.innerHTML = F.map(
		([t, d, c, svg, link], i) => `<a class="feature reveal" href="/docs#${link}" style="--d:${(i % 4) * 0.06}s;text-decoration:none">
			<span class="no">no. ${String(i + 1).padStart(2, '0')}</span>
			<span class="mini" style="--r:${tilt[i]}deg;--tint:${c}"><span class="paper"><span class="face">${icon(svg)}</span></span></span>
			${POSTMARK}
			<h3>${t}</h3><p>${d}</p></a>`
	).join('');
	watch();
})();
watch();

// ---------- film ----------
$$('.film').forEach((f) => {
	const v = $('video', f), b = $('button', f);
	if (reduce) v.pause(), (b.textContent = 'Play');
	b.addEventListener('click', () => (v.paused ? (v.play(), (b.textContent = 'Pause')) : (v.pause(), (b.textContent = 'Play'))));
});

// ---------- the friends checklist, remembered on this device ----------
(() => {
	const list = $('#try');
	if (!list) return;
	const items = $$('li', list);
	let saved = [];
	try {
		saved = JSON.parse(localStorage.getItem('nool-try') || '[]');
	} catch {}
	const tally = () => {
		const n = items.filter((li) => li.classList.contains('done')).length;
		$('#tally').textContent = n === items.length ? 'All of them. Thank you, truly.' : n ? `${n} of ${items.length} tried` : '';
	};
	items.forEach((li, i) => {
		li.setAttribute('role', 'checkbox');
		li.tabIndex = 0;
		const set = (on) => (li.classList.toggle('done', on), li.setAttribute('aria-checked', on));
		set(saved.includes(i));
		const flip = () => {
			set(!li.classList.contains('done'));
			try {
				localStorage.setItem('nool-try', JSON.stringify(items.map((x, j) => (x.classList.contains('done') ? j : -1)).filter((j) => j >= 0)));
			} catch {}
			tally();
		};
		li.addEventListener('click', flip);
		li.addEventListener('keydown', (e) => (e.key === ' ' || e.key === 'Enter') && (e.preventDefault(), flip()));
	});
	tally();
})();

// ---------- download: the right installer for this computer ----------
(async () => {
	const btn = $('#download');
	if (!btn) return;
	const ua = navigator.userAgent;
	const mobile = /Android|iPhone|iPad/i.test(ua);
	const os = mobile ? null : /Mac/i.test(ua) ? 'mac' : /Win/i.test(ua) ? 'windows' : /Linux/i.test(ua) ? 'linux' : null;
	const names = { mac: 'Mac', windows: 'Windows', linux: 'Linux' };
	const pick = { mac: (n) => n.endsWith('.dmg'), windows: (n) => n.endsWith('-setup.exe'), linux: (n) => n.endsWith('.AppImage') };
	if (mobile) $('#dl-meta').textContent = 'a desktop app. open this page on your computer';
	try {
		const res = await fetch('https://api.github.com/repos/krusin1/nool/releases/latest');
		if (!res.ok) return;
		const rel = await res.json();
		const find = (k) => rel.assets.find((a) => pick[k](a.name));
		if (os && find(os)) {
			const a = find(os);
			btn.href = a.browser_download_url;
			$('#dl-label').textContent = `Download for ${names[os]}`;
			$('#dl-meta').textContent = `${rel.tag_name}, ${Math.round(a.size / 1048576)} MB, free`;
		}
		const others = Object.keys(names).filter((k) => k !== os && find(k));
		if (others.length) $('#others').innerHTML = 'Also for ' + others.map((k) => `<a href="${find(k).browser_download_url}">${names[k]}</a>`).join(' and ') + '.';
	} catch {
		/* keep the plain link */
	}
	btn.addEventListener('click', () => {
		if (!btn.href.includes('/download/')) return;
		const l = $('#dl-label'), was = l.textContent;
		l.textContent = 'In the post';
		setTimeout(() => (l.textContent = was), 2600);
	});
})();

// ---------- docs: contents, scrollspy, search, copy, install tabs ----------
(() => {
	const toc = $('.toc');
	if (!toc) return;
	$('.toc-toggle', toc)?.addEventListener('click', () => toc.classList.toggle('open'));
	const links = $$('nav a', toc);
	const map = new Map(links.map((a) => [a.getAttribute('href').slice(1), a]));
	const sections = $$('.prose section[id]');
	sections.forEach((s, i) => {
		const h = $('h2', s);
		if (h) h.insertAdjacentHTML('afterbegin', `<span class="no">no. ${String(i + 1).padStart(2, '0')}</span>`);
	});
	const spy = new IntersectionObserver(
		(es) =>
			es.forEach((e) => {
				if (!e.isIntersecting) return;
				links.forEach((a) => a.classList.remove('active'));
				map.get(e.target.id)?.classList.add('active');
			}),
		{ rootMargin: '-15% 0px -75% 0px' }
	);
	sections.forEach((s) => spy.observe(s));

	const q = $('.search', toc);
	q?.addEventListener('input', () => {
		const term = q.value.trim().toLowerCase();
		let shown = 0;
		sections.forEach((s) => {
			const hit = !term || s.textContent.toLowerCase().includes(term);
			s.classList.toggle('hidden-by-search', !hit);
			map.get(s.id)?.classList.toggle('hidden-by-search', !hit);
			shown += hit;
		});
		$('.no-results').hidden = shown > 0;
	});
	addEventListener('keydown', (e) => {
		if (e.key === '/' && document.activeElement !== q && !/input|textarea/i.test(document.activeElement.tagName)) e.preventDefault(), q?.focus();
	});

	$$('.code').forEach((c) => {
		const b = document.createElement('button');
		b.className = 'copy';
		b.textContent = 'Copy';
		c.append(b);
		b.addEventListener('click', async () => {
			try {
				await navigator.clipboard.writeText($('pre', c).innerText);
				b.textContent = 'Copied';
				b.classList.add('done');
				setTimeout(() => ((b.textContent = 'Copy'), b.classList.remove('done')), 1600);
			} catch {}
		});
	});

	const ua = navigator.userAgent;
	const mine = /Mac/i.test(ua) ? 'mac' : /Win/i.test(ua) ? 'windows' : 'linux';
	$$('.os-tabs').forEach((tabs) => {
		const group = tabs.dataset.group;
		const show = (os) => {
			$$('button', tabs).forEach((b) => b.setAttribute('aria-selected', b.dataset.os === os));
			$$(`[data-os-panel][data-group="${group}"]`).forEach((p) => (p.hidden = p.dataset.osPanel !== os));
		};
		$$('button', tabs).forEach((b) => b.addEventListener('click', () => show(b.dataset.os)));
		show(mine);
	});
})();
