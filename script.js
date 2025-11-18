
    /* threadtales-counter-tip.js
   Place in the same folder as the HTML file and ensure the HTML <script src="threadtales-counter-tip.js"> matches.
   This file contains:
     • patterns loader + yarn SVG handling (same behavior as before)
     • row & stitch counter logic (unchanged behavior)
     • Tip of the Day popup that shows once every 1 hour, and sometimes after increments
*/

    /* ---------------------------
      CONFIG / Patterns & Yarn
    ----------------------------*/
    (() => {
        const PATTERN_JSON = 'patternData.json';
        const patternsGrid = document.getElementById('patternsGrid');

        /* helper: create card (identical behavior) */
        function createCard(title, imgSrc, summary, patternText) {
            const card = document.createElement('article');
            card.className = 'pattern-card';
            card.innerHTML = `
      <img class="card-media" src="${imgSrc}" alt="${title} illustration" loading="lazy">
      <div class="card-body">
        <div>
          <div class="card-title">${title}</div>
          <div class="card-desc">${summary}</div>
        </div>

        <div class="btn-row" style="margin-top:12px">
          <button class="btn btn-primary toggle-btn" type="button">Show pattern</button>
          <button class="btn btn-ghost copy-btn" type="button">Copy pattern</button>
        </div>

        <div class="pattern-details" aria-hidden="true"><pre></pre></div>
      </div>
    `;

            const toggleBtn = card.querySelector('.toggle-btn');
            const copyBtn = card.querySelector('.copy-btn');
            const details = card.querySelector('.pattern-details');
            const pre = details.querySelector('pre');

            pre.textContent = patternText || 'Pattern not available.';

            toggleBtn.addEventListener('click', () => {
                const now = details.classList.toggle('visible');
                details.setAttribute('aria-hidden', now ? 'false' : 'true');
                toggleBtn.textContent = now ? 'Hide pattern' : 'Show pattern';
                if (now) details.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            });

            copyBtn.addEventListener('click', async () => {
                try {
                    await navigator.clipboard.writeText(pre.textContent);
                    copyBtn.textContent = 'Copied!';
                    setTimeout(() => copyBtn.textContent = 'Copy pattern', 1400);
                } catch (e) {
                    copyBtn.textContent = 'Copy failed';
                    setTimeout(() => copyBtn.textContent = 'Copy pattern', 1400);
                }
            });

            return card;
        }

        /* Builders (unchanged) */
        function buildCushionText(d) {
            if (!d) return 'No data.';
            let out = '';
            if (d.abbreviations) {
                out += 'Abbreviations:\n';
                for (const [k, v] of Object.entries(d.abbreviations)) out += `  ${k} — ${v}\n`;
                out += '\n';
            }
            if (d.notes && d.notes.length) {
                out += 'Notes:\n';
                d.notes.forEach((n, i) => out += `  ${i + 1}. ${n}\n`);
                out += '\n';
            }
            if (d.rounds) {
                out += 'Rounds:\n';
                for (const r of Object.keys(d.rounds)) out += `Round ${r}: ${d.rounds[r]}\n\n`;
            }
            if (d.instructions_after_round_12) out += `${d.instructions_after_round_12}\n`;
            return out.trim();
        }

        function buildPlushText(d) {
            if (!d) return 'No data.';
            let out = '';
            if (d.abbreviations) {
                out += 'Abbreviations:\n';
                for (const [k, v] of Object.entries(d.abbreviations)) out += `  ${k} — ${v}\n`;
                out += '\n';
            }
            if (d.head) {
                out += 'Head:\n';
                for (const [k, v] of Object.entries(d.head)) out += `  Round ${k}: ${v}\n`;
                out += '\n';
            }
            if (d.legs) {
                out += 'Legs:\n';
                for (const [k, v] of Object.entries(d.legs)) out += `  ${k}: ${v}\n`;
                out += '\n';
            }
            if (d.body) {
                out += 'Body:\n';
                for (const [k, v] of Object.entries(d.body)) out += `  Round ${k}: ${v}\n`;
                out += '\n';
            }
            if (d.ears) {
                out += 'Ears:\n';
                for (const [k, v] of Object.entries(d.ears)) out += `  ${k}: ${v}\n`;
                out += '\n';
            }
            if (d.hands) {
                out += 'Hands:\n';
                for (const [k, v] of Object.entries(d.hands)) out += `  ${k}: ${v}\n`;
                out += '\n';
            }
            return out.trim();
        }

        function buildMeshText(d) {
            if (!d) return 'No data.';
            let out = '';
            if (d.back_panel) {
                out += 'Back panel:\n';
                for (const [k, v] of Object.entries(d.back_panel)) out += `  ${k}: ${v}\n`;
                out += '\n';
            }
            if (d.shoulder_section) {
                out += 'Shoulder section:\n';
                for (const [k, v] of Object.entries(d.shoulder_section)) out += `  ${k}: ${v}\n`;
                out += '\n';
            }
            if (d.front_panel) {
                out += 'Front panel rows:\n';
                if (Array.isArray(d.front_panel.rows)) d.front_panel.rows.forEach(r => out += `  ${r}\n`);
                out += '\n';
            }
            if (d.sleeves) {
                out += 'Sleeves:\n';
                for (const [k, v] of Object.entries(d.sleeves)) out += `  ${k}: ${v}\n`;
                out += '\n';
            }
            return out.trim();
        }

        async function loadPatterns() {
            if (!patternsGrid) return;
            patternsGrid.innerHTML = '<div class="loading">Loading patterns…</div>';
            try {
                const r = await fetch(PATTERN_JSON, { cache: 'no-store' });
                if (!r.ok) throw new Error('patternData.json not found or invalid');
                const data = await r.json();
                patternsGrid.innerHTML = '';

                const cushionData = data.cushion || {};
                const cushionSummary = cushionData.notes && cushionData.notes.length ? cushionData.notes[0] : 'Heart cushion, rounds shown below.';
                const cushionText = buildCushionText(cushionData);
                patternsGrid.appendChild(createCard('Heart Cushion', 'images/heartCushion.png', cushionSummary, cushionText));

                const plushData = data.plushie || {};
                const plushSummary = 'Small plushie — head, legs, body, ears, hands.';
                const plushText = buildPlushText(plushData);
                patternsGrid.appendChild(createCard('Plushie', 'images/plushie.png', plushSummary, plushText));

                const meshData = data.mesh_top || data.meshTop || {};
                const meshSummary = 'Light mesh top — back, front, shoulders & sleeves.';
                const meshText = buildMeshText(meshData);
                patternsGrid.appendChild(createCard('Mesh Top', 'images/meshTop.png', meshSummary, meshText));
            } catch (err) {
                patternsGrid.innerHTML = `<div class="error">Failed to load patterns. Make sure <code>${PATTERN_JSON}</code> is present. (${err.message})</div>`;
                console.error(err);
            }
        }

        /* Yarn selector logic (unchanged) */
        const palettePresets = [
            { name: 'Amethyst', hex: '#956a82' },
            { name: 'Avocado', hex: '#705e2d' },
            { name: 'Blush', hex: '#eb7c81' },
            { name: 'Lagoon', hex: '#146d83' },
            { name: 'Peach', hex: '#d68f84' },
            { name: 'Copper', hex: '#8d6738' },
            { name: 'Brown marbel', hex: '#6d604f' },
            { name: 'Lilac', hex: '#9b7fad' },
            { name: 'Ruby', hex: '#9d0e2b' }
        ];

        const previewContainer = document.getElementById('previewContainer');
        const colorPicker = document.getElementById('colorPicker');
        const paletteContainer = document.getElementById('paletteContainer');

        // render palette swatches
        if (paletteContainer) {
            palettePresets.forEach(p => {
                const el = document.createElement('div');
                el.className = 'swatch';
                el.style.background = p.hex;
                el.style.color = '#fff';
                el.title = p.name + ' — ' + p.hex;
                el.innerHTML = `<div style="font-size:13px">${p.name}</div><div style="font-size:12px;opacity:.85">${p.hex}</div>`;
                el.addEventListener('click', () => applyColorToYarn(p.hex));
                paletteContainer.appendChild(el);
            });
        }

        async function loadYarnSVG() {
            if (!previewContainer) return;
            try {
                const resp = await fetch('yarn.svg', { cache: 'no-store' });
                if (!resp.ok) throw new Error('yarn.svg not found');
                const text = await resp.text();
                previewContainer.innerHTML = text;
                const svg = previewContainer.querySelector('svg');
                if (svg) svg.id = svg.id || 'yarnSVG';
                applyColorToYarn(colorPicker?.value || '#676767');
            } catch (err) {
                // fallback stylized yarn (improved paths so it looks like a ball)
                previewContainer.innerHTML = `
        <svg id="yarnSVG" viewBox="0 0 200 200" width="280" height="280" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <g transform="translate(100,100)">
            <circle cx="0" cy="0" r="55" fill="#676767" />
            <path d="M-48,-12 C-28,-36 28,-36 48,-12" stroke="#565656" stroke-width="6" stroke-linecap="round" fill="none" />
            <path d="M-52,12 C-30,36 30,36 52,12" stroke="#565656" stroke-width="6" stroke-linecap="round" fill="none" />
            <path d="M-40,-30 C-10,-5 10,-5 40,-30" stroke="#484848" stroke-width="5" stroke-linecap="round" fill="none"/>
            <path d="M-40,20 C-10,5 10,5 40,20" stroke="#484848" stroke-width="5" stroke-linecap="round" fill="none"/>
            <circle cx="0" cy="0" r="18" fill="#f6f5f4" />
          </g>
        </svg>
      `;
                applyColorToYarn(colorPicker?.value || '#676767');
            }
        }

        function applyColorToYarn(color) {
            if (!previewContainer) return;
            const svg = previewContainer.querySelector('#yarnSVG');
            if (!svg) return;
            const parts = svg.querySelectorAll('path, circle, rect, polygon, ellipse');
            parts.forEach(p => {
                try {
                    if (p.tagName.toLowerCase() === 'circle' && p.getAttribute('r') && Number(p.getAttribute('r')) < 22) {
                        p.setAttribute('fill', '#f6f5f4');
                        p.setAttribute('stroke', 'none');
                    } else {
                        if (p.hasAttribute('fill') || ['path', 'polygon', 'ellipse', 'rect', 'circle'].includes(p.tagName.toLowerCase())) {
                            p.setAttribute('fill', color);
                        }
                        if (p.tagName.toLowerCase() === 'path') p.setAttribute('stroke', color);
                    }
                } catch (e) { /* ignore */ }
            });
            // also set main big circle (if present)
            const big = svg.querySelector('circle');
            if (big) try { big.setAttribute('fill', color); } catch (e) { }
            if (colorPicker) colorPicker.value = color;
        }

        if (colorPicker) colorPicker.addEventListener('input', (e) => applyColorToYarn(e.target.value));

        // init
        loadYarnSVG();
        loadPatterns();

        // expose for debug
        window._threadtales = { applyColorToYarn, loadYarnSVG, loadPatterns };
    })();

    /* ====================================
            COUNTER + TIP LOGIC (Part 2)
       Behavior: counter works exactly as before.
       Tip of the Day: shown on first visit and thereafter only if 1 hour has passed
       (localStorage key 'tt_lastTipTime' keeps timestamp in ms).
       Also a small random chance to show when incrementing counts.
    =====================================*/

    (function () {
        const TIP_KEY = 'tt_lastTipTime';
        const HOUR_MS = 60 * 60 * 1000;

        // Tip pool (same messages you used)
        const tips = [
            "Always count your stitches at the end of each row.",
            "Use stitch markers to avoid losing your place.",
            "Write down your row count to avoid confusion later.",
            "Choose yarn that matches your hook size for cleaner stitches.",
            "Take short breaks to avoid hand strain.",
            "Keep your tension consistent for even rows."
        ];

        // Tip DOM
        const tipBox = document.getElementById('tipBox');
        const tipText = document.getElementById('tipText');
        const closeTipBtn = document.getElementById('closeTip');

        // show the tip box with a random tip
        function showTip() {
            if (!tipBox || !tipText) return;
            tipText.textContent = tips[Math.floor(Math.random() * tips.length)];
            tipBox.style.display = 'block';
        }

        // hide and store timestamp
        function hideTipAndStore() {
            if (!tipBox) return;
            tipBox.style.display = 'none';
            try {
                localStorage.setItem(TIP_KEY, Date.now().toString());
            } catch (e) { /* ignore */ }
        }

        // Close handler
        if (closeTipBtn) {
            closeTipBtn.addEventListener('click', hideTipAndStore);
        }

        // On page load: decide whether to show tip based on last shown time
        function maybeShowTipOnLoad() {
            try {
                const last = Number(localStorage.getItem(TIP_KEY)) || 0;
                const now = Date.now();
                if (!last || (now - last) >= HOUR_MS) {
                    // show tip now and set timestamp only when user closes (so they see it)
                    showTip();
                }
            } catch (e) {
                // if localStorage unavailable, just show the tip once
                showTip();
            }
        }

        // counters (preserve exact behavior)
        let rows = Number(localStorage.getItem("rows")) || 0;
        let stitches = Number(localStorage.getItem("stitches")) || 0;

        // initialize UI
        const rowEl = document.getElementById("rowCount");
        const stitchEl = document.getElementById("stitchCount");
        if (rowEl) rowEl.textContent = rows;
        if (stitchEl) stitchEl.textContent = stitches;

        // celebrate animation (unchanged feel)
        function celebrate(targetId) {
            const target = document.getElementById(targetId);
            if (!target) return;
            const star = document.createElement("div");
            star.className = "star-effect";
            star.textContent = "✨";

            const rect = target.getBoundingClientRect();
            // Use viewport-based fixed positioning so it animates nicely
            star.style.left = (rect.left + rect.width / 2) + "px";
            star.style.top = (rect.top) + "px";

            document.body.appendChild(star);
            setTimeout(() => star.remove(), 800);
        }

        // Public functions used by the HTML buttons (names preserved)
        window.updateCount = function (type, val) {
            if (type === "rows") {
                let old = rows;
                rows = Math.max(0, rows + val);
                if (rowEl) rowEl.textContent = rows;
                try { localStorage.setItem("rows", String(rows)); } catch (e) { /* ignore */ }
                if (rows > old) {
                    celebrate("rowCount");
                    // small chance to show tip on increment (25%)
                    if (Math.random() < 0.25) showTip();
                }
            } else {
                let old = stitches;
                stitches = Math.max(0, stitches + val);
                if (stitchEl) stitchEl.textContent = stitches;
                try { localStorage.setItem("stitches", String(stitches)); } catch (e) { /* ignore */ }
                if (stitches > old) {
                    celebrate("stitchCount");
                    if (Math.random() < 0.25) showTip();
                }
            }
        };

        window.resetCount = function (type) {
            if (type === "rows") {
                rows = 0;
                if (rowEl) rowEl.textContent = 0;
                try { localStorage.setItem("rows", "0"); } catch (e) { /* ignore */ }
            } else {
                stitches = 0;
                if (stitchEl) stitchEl.textContent = 0;
                try { localStorage.setItem("stitches", "0"); } catch (e) { /* ignore */ }
            }
        };

        // Show tip on load based on hourly rule
        // call after DOM is ready
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", maybeShowTipOnLoad);
        } else {
            maybeShowTipOnLoad();
        }
    })();

    (async () => {
        const TUTORIAL_JSON = 'tutorialsData.json';
        const tutorialsGrid = document.getElementById('tutorialsGrid');
        const levelFilter = document.getElementById('levelFilter');
        let tutorialsData = []; // store loaded tutorials

        function createTutorialCard(title, imgSrc, description, level, ytlink) {
            const card = document.createElement('article');
            card.className = 'pattern-card';
            card.innerHTML = `
            <img class="card-media" src="${imgSrc}" alt="${title} illustration" loading="lazy">
            <div class="card-body">
                <div>
                    <div class="card-title">${title}</div>
                    <div class="card-desc">${description}</div>
                    <div class="card-level">${level}</div>
                </div>
                <div class="btn-row" style="margin-top:12px">
                    <button class="btn btn-primary tutorial-btn" type="button">Watch Tutorial</button>
                </div>
            </div>
        `;
            const btn = card.querySelector('.tutorial-btn');
            btn.addEventListener('click', () => {
                window.open(ytlink, '_blank');
            });
            return card;
        }

        function renderTutorials(level = 'all') {
            tutorialsGrid.innerHTML = '';
            const filtered = tutorialsData.filter(t => level === 'all' || t.level === level);
            if (filtered.length === 0) {
                tutorialsGrid.innerHTML = '<p>No tutorials found for this level.</p>';
            } else {
                filtered.forEach(item => {
                    tutorialsGrid.appendChild(
                        createTutorialCard(item.itemn, item.imgSrc, item.descrip, item.level, item.ytlink)
                    );
                });
            }
        }

        async function loadTutorials() {
            tutorialsGrid.innerHTML = '<div class="loading">Loading tutorials…</div>';

            try {
                const r = await fetch(TUTORIAL_JSON, { cache: 'no-store' });
                if (!r.ok) throw new Error('tutorialsData.json not found or invalid');
                tutorialsData = await r.json(); // store data
                renderTutorials(); // show all by default
            } catch (err) {
                tutorialsGrid.innerHTML = `<div class="error">Failed to load tutorials: ${err.message}</div>`;
                console.error(err);
            }
        }

        if (levelFilter) {
            levelFilter.addEventListener('change', (e) => {
                renderTutorials(e.target.value);
            });
        }

        loadTutorials();
    })();


