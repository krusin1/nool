// Nool site: small interactions. Everything works without it; motion respects reduced-motion.
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];

// Perforated stamp edge, shared by every stamp shape.
(() => {
	const W = 200, H = 250, r = 5.5, step = 12.5;
	let holes = '';
	for (let x = 0; x <= W; x += step) holes += `<circle cx="${x}" cy="0" r="${r}"/><circle cx="${x}" cy="${H}" r="${r}"/>`;
	for (let y = 0; y <= H; y += step) holes += `<circle cx="0" cy="${y}" r="${r}"/><circle cx="${W}" cy="${y}" r="${r}"/>`;
	const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none"><defs><mask id="m"><rect width="${W}" height="${H}" fill="white"/><g fill="black">${holes}</g></mask></defs><rect width="${W}" height="${H}" fill="black" mask="url(#m)"/></svg>`;
	document.documentElement.style.setProperty('--perf', `url("data:image/svg+xml,${encodeURIComponent(svg)}")`);
})();

// Nav border once you scroll.
addEventListener('scroll', () => $('.nav')?.classList.toggle('scrolled', scrollY > 8), { passive: true });

// Reveal on scroll.
const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && (e.target.classList.add('in'), io.unobserve(e.target))), { rootMargin: '0px 0px -10% 0px' });
$$('.reveal').forEach((el) => io.observe(el));

// Magnetic buttons: drift a little toward the cursor.
if (!reduce && matchMedia('(hover: hover)').matches)
	$$('.btn.magnet').forEach((b) => {
		b.addEventListener('pointermove', (e) => {
			const r = b.getBoundingClientRect();
			b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.18}px, ${(e.clientY - r.top - r.height / 2) * 0.3}px)`;
		});
		b.addEventListener('pointerleave', () => (b.style.transform = ''));
	});

const POSTMARK = (date) => `<svg class="postmark" viewBox="0 0 160 80" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="2.4"><circle cx="40" cy="40" r="32"/><circle cx="40" cy="40" r="25" stroke-width="1"/>${[24, 34, 44, 54].map((y) => `<path d="M80 ${y} q10 -6 20 0 t20 0 t20 0 t20 0"/>`).join('')}</g><g fill="currentColor" text-anchor="middle" font-family="Space Grotesk, sans-serif" font-weight="600"><text x="40" y="38" font-size="8.5" letter-spacing=".5">POSTED</text><text x="40" y="49" font-size="7">${date}</text></g></svg>`;
const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();

// ---------- hero: a desk of stamps that tilt toward the cursor; click to post ----------
(() => {
	const desk = $('#stamp-desk');
	if (!desk) return;
	const motifs = {
		rings: [10, 20, 30, 40, 50, 60].map((r) => `<circle cx="72" cy="30" r="${r}"/>`).join(''),
		stripes: Array.from({ length: 14 }, (_, i) => `<path d="M${i * 9 - 20} 0 L${i * 9 + 40} 120"/>`).join(''),
		grid: Array.from({ length: 11 }, (_, i) => `<path d="M${i * 10} 0 V120 M0 ${i * 10} H100"/>`).join(''),
		thread: '<path d="M18 108 V58 C18 36 32 26 50 26 C68 26 82 36 82 58 V90 C82 104 92 112 108 108" stroke-width="5"/>'
	};
	const stamps = [
		{ t: 'Signal Garden', v: '14', paper: '#F3EFE6', ink: '#2B4BFF', m: 'rings', x: 4, y: 12, r: -7 },
		{ t: 'Tidal', v: '22', paper: '#F6E7D8', ink: '#C2410C', m: 'stripes', x: 44, y: 2, r: 5 },
		{ t: 'Soft Machines', v: '07', paper: '#E7EEE4', ink: '#2F6B4F', m: 'grid', x: 26, y: 42, r: -2 }
	];
	desk.insertAdjacentHTML(
		'afterbegin',
		stamps
			.map(
				(s, i) => `<div class="stamp-holder" style="left:${s.x}%;top:${s.y}%;z-index:${i + 1}" data-r="${s.r}">
				<button class="stamp" aria-label="Post ${s.t}" style="--paper:${s.paper};--ink:${s.ink};transform:rotate(${s.r}deg)">
					<div class="face"><svg viewBox="0 0 100 120" preserveAspectRatio="xMidYMid slice" fill="none" stroke="currentColor" stroke-width="1.2">${motifs[s.m]}</svg>
					<span class="c">NOOL · 2026</span><span class="v">${s.v}</span><span class="t">${s.t}</span></div>
				</button>${POSTMARK(today)}</div>`
			)
			.join('')
	);
	const holders = $$('.stamp-holder', desk);
	let top = holders.length;
	// Tilt toward the cursor.
	if (!reduce)
		desk.addEventListener('pointermove', (e) => {
			holders.forEach((h) => {
				const r = h.getBoundingClientRect();
				const dx = (e.clientX - (r.left + r.width / 2)) / 260;
				const dy = (e.clientY - (r.top + r.height / 2)) / 260;
				const s = $('.stamp', h);
				s.style.transform = `rotate(${h.dataset.r}deg) rotateY(${Math.max(-1, Math.min(1, dx)) * 14}deg) rotateX(${Math.max(-1, Math.min(1, dy)) * -14}deg)`;
			});
		});
	desk.addEventListener('pointerleave', () => holders.forEach((h) => ($('.stamp', h).style.transform = `rotate(${h.dataset.r}deg)`)));
	// Click: bring to the front, postmark it, shake. Click again to recall.
	let posted = 0;
	holders.forEach((h) =>
		$('.stamp', h).addEventListener('click', () => {
			h.style.zIndex = ++top;
			const on = !h.classList.contains('posted');
			h.classList.toggle('posted', on);
			posted += on ? 1 : -1;
			if (on && !reduce) {
				h.classList.remove('shake');
				void h.offsetWidth;
				h.classList.add('shake');
			}
			$('.stamp', h).setAttribute('aria-label', `${on ? 'Recall' : 'Post'} ${$('.t', h).textContent}`);
			const hint = $('.desk-hint', desk);
			hint.innerHTML =
				posted === holders.length
					? '<b>All posted.</b> Every project ends up as a letter.'
					: posted
						? `<b>Posted ${posted} of ${holders.length}.</b> Click again to recall.`
						: 'Every project is a stamp. <b>Click one to post it.</b>';
		})
	);
})();

// ---------- demo: the composer, actually typeable ----------
(() => {
	const form = $('#mini-composer');
	if (!form) return;
	const list = $('.mini-blocks', form.parentElement);
	const input = $('input', form);
	const add = (text) => {
		const url = /^https?:\/\/\S+$/i.test(text);
		const el = document.createElement('div');
		el.className = 'mini-block';
		el.innerHTML = `<span class="tag">${url ? 'Link' : 'Note'}</span>`;
		el.append(document.createTextNode(url ? new URL(text).hostname : text));
		list.append(el);
		while (list.children.length > 3) list.firstElementChild.remove();
	};
	form.addEventListener('submit', (e) => {
		e.preventDefault();
		const t = input.value.trim();
		if (t) add(t), (input.value = '');
		clearTimeout(auto);
	});
	// Until someone types, it types to itself.
	const lines = ['Foam held its shape at 40%.', 'https://www.metmuseum.org', 'Try the slower pump curve.'];
	let auto, i = 0;
	const loop = () => {
		if (document.activeElement === input || reduce) return;
		const line = lines[i++ % lines.length];
		let n = 0;
		const type = () => {
			if (document.activeElement === input) return (input.value = '');
			input.value = line.slice(0, ++n);
			if (n < line.length) auto = setTimeout(type, 38);
			else auto = setTimeout(() => (add(line), (input.value = ''), (auto = setTimeout(loop, 1400))), 450);
		};
		type();
	};
	const obs = new IntersectionObserver(([e]) => e.isIntersecting && (obs.disconnect(), loop()));
	obs.observe(form);
	input.addEventListener('focus', () => (clearTimeout(auto), (input.value = '')));
})();

// ---------- demo: apps send work to Nool ----------
(() => {
	const box = $('#sources');
	if (!box) return;
	const hub = $('.hub', box);
	const send = (app) => {
		const a = app.getBoundingClientRect(), h = hub.getBoundingClientRect(), b = box.getBoundingClientRect();
		const f = document.createElement('span');
		f.className = 'flyer';
		f.textContent = `via ${app.dataset.app}`;
		f.style.left = `${a.right - b.left - 20}px`;
		f.style.top = `${a.top - b.top + 4}px`;
		box.append(f);
		const dx = h.left - a.right + 30, dy = h.top + h.height / 2 - a.top - 14;
		f.animate(
			[{ transform: 'translate(0,0) scale(1)', opacity: 1 }, { transform: `translate(${dx / 2}px, ${dy / 2 - 26}px) scale(1.05)`, opacity: 1, offset: 0.5 }, { transform: `translate(${dx}px, ${dy}px) scale(0.4)`, opacity: 0 }],
			{ duration: reduce ? 1 : 700, easing: 'cubic-bezier(.4,0,.2,1)' }
		).onfinish = () => {
			f.remove();
			hub.classList.remove('got');
			void hub.offsetWidth;
			hub.classList.add('got');
		};
	};
	$$('.app', box).forEach((a) => {
		a.addEventListener('click', () => send(a));
		a.addEventListener('pointerenter', () => send(a));
	});
	// A gentle idle loop until someone interacts.
	let k = 0, idle = setInterval(() => send($$('.app', box)[k++ % 3]), 1800);
	box.addEventListener('pointerenter', () => clearInterval(idle), { once: true });
})();

// ---------- demo: keep precedents ----------
$$('.pcard .keep').forEach((b) =>
	b.addEventListener('click', () => {
		const c = b.closest('.pcard');
		const on = c.classList.toggle('kept');
		b.textContent = on ? 'Kept' : 'Keep';
		b.setAttribute('aria-pressed', on);
	})
);

// ---------- demo: voice bars ----------
(() => {
	const v = $('#voice-demo');
	if (!v) return;
	const bars = $('.bars', v);
	bars.innerHTML = '<span></span>'.repeat(22);
	const spans = $$('span', bars);
	let t;
	const tick = () => spans.forEach((s, i) => (s.style.height = `${18 + Math.abs(Math.sin(Date.now() / 180 + i * 0.7)) * 70 * Math.random() + 10}%`));
	$('.rec', v).addEventListener('click', () => {
		const on = v.classList.toggle('recording');
		$('.rec span', v).textContent = on ? 'Stop' : 'Record';
		clearInterval(t);
		if (on) t = setInterval(tick, 110);
		else spans.forEach((s) => (s.style.height = '18%'));
	});
})();

// ---------- demo: post the envelope ----------
$$('.env-demo').forEach((d) => {
	$('.pm', d)?.insertAdjacentHTML('beforeend', '');
	d.addEventListener('click', () => {
		d.classList.remove('sent');
		void d.offsetWidth;
		d.classList.add('sent');
	});
});

// ---------- film: play/pause ----------
$$('.film').forEach((f) => {
	const v = $('video', f), b = $('button', f);
	if (reduce) v.pause(), (b.textContent = 'Play');
	b.addEventListener('click', () => (v.paused ? (v.play(), (b.textContent = 'Pause')) : (v.pause(), (b.textContent = 'Play'))));
});

// ---------- friends checklist (remembered on this device) ----------
(() => {
	const list = $('#try');
	if (!list) return;
	const items = $$('li', list);
	let saved = [];
	try {
		saved = JSON.parse(localStorage.getItem('nool-try') || '[]');
	} catch {}
	const bar = $('.progress i');
	const update = () => {
		const done = items.filter((li) => li.classList.contains('done')).length;
		bar.style.width = `${(done / items.length) * 100}%`;
		$('#try-count').textContent = done === items.length ? 'All done. Thank you!' : `${done} of ${items.length} tried`;
	};
	items.forEach((li, i) => {
		li.setAttribute('role', 'checkbox');
		li.tabIndex = 0;
		const set = (on) => {
			li.classList.toggle('done', on);
			li.setAttribute('aria-checked', on);
		};
		set(saved.includes(i));
		const flip = () => {
			set(!li.classList.contains('done'));
			try {
				localStorage.setItem('nool-try', JSON.stringify(items.map((x, j) => (x.classList.contains('done') ? j : -1)).filter((j) => j >= 0)));
			} catch {}
			update();
		};
		li.addEventListener('click', flip);
		li.addEventListener('keydown', (e) => (e.key === ' ' || e.key === 'Enter') && (e.preventDefault(), flip()));
	});
	update();
})();

// ---------- download: the right installer for this computer ----------
(async () => {
	const btn = $('#download');
	if (!btn) return;
	const ua = navigator.userAgent;
	const os = /Mac/i.test(ua) ? 'mac' : /Win/i.test(ua) ? 'windows' : /Linux/i.test(ua) && !/Android/i.test(ua) ? 'linux' : null;
	const labels = { mac: 'macOS', windows: 'Windows', linux: 'Linux' };
	const pick = { mac: (n) => n.endsWith('.dmg'), windows: (n) => n.endsWith('-setup.exe'), linux: (n) => n.endsWith('.AppImage') };
	try {
		const res = await fetch('https://api.github.com/repos/krusin1/nool/releases/latest');
		if (!res.ok) return;
		const rel = await res.json();
		const find = (k) => rel.assets.find((a) => pick[k](a.name));
		const meta = $('#meta');
		if (os && find(os)) {
			const a = find(os);
			btn.href = a.browser_download_url;
			$('span', btn).textContent = `Download for ${labels[os]}`;
			meta.firstChild.textContent = `${rel.tag_name} · ${(a.size / 1048576).toFixed(0)} MB · free`;
		} else if (/Android|iPhone|iPad/i.test(ua)) {
			meta.firstChild.textContent = 'Nool is a desktop app. Open this page on your computer to download it.';
		}
		const others = Object.keys(labels).filter((k) => k !== os && find(k));
		$('#others').innerHTML = others.length ? 'Also for ' + others.map((k) => `<a href="${find(k).browser_download_url}">${labels[k]}</a>`).join(' · ') : '';
	} catch {
		/* keep the link to the releases page */
	}
	// A little stamp when the download starts.
	btn.addEventListener('click', () => {
		if (reduce || !btn.href.includes('/download/')) return;
		const s = $('span', btn), was = s.textContent;
		s.textContent = 'Posted to your computer';
		setTimeout(() => (s.textContent = was), 2600);
	});
})();

// ---------- docs: table of contents, scrollspy, search, copy, OS tabs ----------
(() => {
	const toc = $('.toc');
	if (!toc) return;
	$('.toc-toggle', toc)?.addEventListener('click', () => toc.classList.toggle('open'));
	const links = $$('nav a', toc);
	const map = new Map(links.map((a) => [a.getAttribute('href').slice(1), a]));
	const spy = new IntersectionObserver(
		(es) =>
			es.forEach((e) => {
				if (!e.isIntersecting) return;
				links.forEach((a) => a.classList.remove('active'));
				map.get(e.target.id)?.classList.add('active');
			}),
		{ rootMargin: '-20% 0px -70% 0px' }
	);
	$$('.prose section[id]').forEach((s) => spy.observe(s));

	// Filter sections by a search word.
	const q = $('.doc-search');
	q?.addEventListener('input', () => {
		const term = q.value.trim().toLowerCase();
		let shown = 0;
		$$('.prose section[id]').forEach((s) => {
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

	// Install steps: show this computer's system first.
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
