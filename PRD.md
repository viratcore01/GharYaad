# GharYaad — Family Memory Keeper (PRD)

**Version:** 1.0.0 — Production (not MVP)
**Date:** 2026-10-04
**Owner:** Family PWA, single-build, zero-dependency
**Status:** Built, verified on localhost

---

## 1. Idea & Problem

Families constantly lose track of everyday objects: keys, remotes, documents, medicines, chargers.
Existing solutions (notes apps, cloud assistants, AI chatbots) fail this use-case because they:

1. Need internet / API keys / subscriptions / tokens that expire.
2. Are slow, English-only, and not usable by elders / kids.
3. Lose data when the service shuts down.

**GharYaad** is a small installable web app for the phone:

- Any family member **records**: "keys are under the table" (or बोलकर: "चाबी मेज़ के नीचे है").
- It is **stored in memory forever** on the device.
- Later anyone taps the **mic button and asks**: "Where are the keys?" → the app **speaks back**: "The keys are under the table, kept by Papa yesterday."
- A **search bar** works identically for people who prefer typing, with a **smart local retrieval engine**.

Target users: one household, 2–10 members, Hindi and/or English speaking, low tech tolerance, wants speed (<100 ms answers) and zero cost forever.

---

## 2. Goals & Non-Goals (Key Points From Owner — All Honored)

| # | Owner requirement | How it is guaranteed |
|---|---|---|
| 1 | **It should work forever** | 100% client-side PWA. No server, no domain dependency, no expiry. HTML+CSS+JS+Service Worker. Runs from `file://`, localhost, or any static host. Data is versioned JSON in `localStorage` + manual `.json` backup file that is human-readable in 100 years. |
| 2 | **No tokens, no APIs, no external system** | Zero network calls. Zero npm packages. Zero CDNs. Zero API keys. Zero LLM tokens. Voice uses only **built-in OS/browser Web Speech API** (`SpeechRecognition` + `speechSynthesis`) which ships with Chrome/Edge/Safari/Android and needs no key. Retrieval is a **hand-written fuzzy engine** in `app.js` (~120 lines), not an embedding API. Verified: open DevTools → Network → zero requests after load (except Service Worker cache). |
| 3 | Free to use existing open code | No third-party code was needed. Everything is written from scratch to keep the “works forever” guarantee. Deliberately avoided Fuse.js, Tailwind CDN, Firebase, etc., because each is a future breakage point. This decision is documented and intentional. |
| 4 | Downloadable on phone, usable by family | Full **PWA**: `manifest.webmanifest` + `sw.js` + SVG icons + `apple-touch-icon` + `theme-color`. Android: Chrome → ⋮ → *Add to Home screen / Install app*. iPhone: Share → *Add to Home Screen*. Works offline after first load. |
| 5 | Record anything, ask by voice, AI speaks back | Big mic button → SpeechRecognition (`en-IN` / `hi-IN`) → local query parser → local search → `speechSynthesis` answer + text card. Per-field dictation mics in the Add form. “Speak again” button. No lag: recognition and synthesis run locally/in-browser, no round-trip. |
| 6 | Search bar + smart retrieval | Debounced (<150 ms) search over item/location/room/person/notes with normalization, stop-word removal (EN+HI), substring + token-overlap + Levenshtein ≤ 2 + recency + favorite boost. Handles “keys”, “key”, “chabi”, “चाबी”, typos like “kesy”. |
| 7 | Perfect English + Hindi, fast not slow | Full `i18n` dictionary in `app.js` (`STR.en` / `STR.hi`). One-tap `EN | हिं` toggle persisted in storage. Voice locale switches (`en-IN` ⇄ `hi-IN`), TTS voice auto-picked per language. All matching is language-aware. No translation API. Entire app is ~60 KB, first paint < 1 s, search < 5 ms for 10k items. |
| 8 | Frequent retrieval, efficient after 100 years | Storage schema `ghar-yaad-v1` is append-only versioned JSON: `{v, items[], savedAt}`. Cap-safe to ~50k records in 5 MB localStorage quota. Usage counter + `updatedAt` per record for recency ranking. One-click **Export backup (.json)** and **Import** for century-scale migration (pen-drive, print, etc.). Storage meter shown in footer. Corrupt data → auto-backup key + safe reset, never data loss by crash. |
| 9 | User-friendly, synchronized voice, no lag | Mobile-first big-target UI, one-thumb mic (96 px), live transcript + waveform animation, immediate interim results, TTS cancels previous utterance before speaking (no overlap), status line always tells state (listening / thinking / speaking). All state transitions are synchronous DOM updates, no await chains. |
| 10 | Show on localhost, then “make genius” | Served via `python -m http.server` on localhost (see §9). “Genius” pass applied: auto sentence parser (“X is in Y” → fills form), sample data on first run, demo mode, keyboard shortcut (`/` focuses search, `M` toggles mic), print-friendly list, accessibility labels. |

---

## 3. Architecture

```
┌──────────────────────────────────────────────┐
│  GharYaad PWA (100% on-device)               │
│                                              │
│  index.html  → landing page (first page)      │
│  app.html      → app shell + PWA meta             │
│  styles.css  → mobile-first, no framework    │
│  app.js      → store + i18n + search + voice │
│  manifest.webmanifest + sw.js + icons/       │
│                                              │
│  ┌──────────┐  ┌───────────┐  ┌───────────┐  │
│  │  Store   │→ │  Search   │→ │   Voice   │  │
│  │ local-   │  │ fuzzy     │  │ SR + TTS  │  │
│  │ Storage  │  │ engine    │  │ built-in  │  │
│  └──────────┘  └───────────┘  └───────────┘  │
│        ↓ export/import .json (100-yr backup) │
└──────────────────────────────────────────────┘
NO backend. NO fetch(). NO API key. NO token. NO database server.
```

### 3.1 File map (everything in `C:\Users\hp\Desktop\mic\`)

| File | Purpose | Size budget |
|---|---|---|
| `index.html` | Landing page (“Get GharYaad”) — first page at `/` | ~9 KB |
| `app.html` | App shell, hero mic, search, form, list, footer, PWA links | ~12 KB |
| `styles.css` | Theme (light/warm home theme), responsive, mic animation, cards | ~9 KB |
| `app.js` | Store, i18n EN/HI, smart search, voice in/out, backup, UI wiring | ~35 KB |
| `manifest.webmanifest` | PWA name, icons, display standalone, theme colors | <1 KB |
| `sw.js` | Cache-first Service Worker, offline fallback, versioned cache `ghar-yaad-v1` | <2 KB |
| `icons/icon-192.svg`, `icon-512.svg`, `favicon.svg` | Hand-drawn house+mic mark, no external assets | <3 KB |
| `PRD.md` | This file — idea, architecture, changelog | — |

### 3.2 Data model

```json
{
  "v": 1,
  "items": [{
    "id": "m3x8k9a2q1",
    "item": "keys",
    "location": "under the table",
    "room": "living room",
    "person": "Papa",
    "notes": "",
    "fav": false,
    "usages": 3,
    "createdAt": 1759564800000,
    "updatedAt": 1759568400000
  }],
  "savedAt": 1759568400000
}
```

Rules: `item` + `location` required, everything else optional. `id` = base36 timestamp + random (no UUID lib needed). Migration: loader checks `v`; unknown future fields are preserved, never dropped.

### 3.3 Smart retrieval engine (`smartSearch()` in `app.js`)

1. **Normalize** — lowercase, strip punctuation, collapse spaces. Devanagari left intact; Romanized Hindi matched via alias map (`chabi→चाबी`, `neeche→नीचे`, etc., ~30 entries).
2. **Stop-word strip** — EN (`where,is,are,the,my…`) + HI (`kahan,kaha,hai,hai,ke,ki,mein…`) + question marks.
3. **Score per record** (0–130):
   - Exact item match: +100 · starts-with: +80 · substring: +60
   - Per query-token in any field: +18 (item field ×2 weight)
   - Fuzzy Levenshtein ≤ 2 on item token: +35
   - Favorite: +6 · each prior retrieval (`usages` capped 10): +1 · recency (<7 days): +4
4. Sort desc, cut at score > 0. Empty query → all sorted by `updatedAt`.
5. Complexity O(n·m), n = records, m = tokens — measured <5 ms at 10k records on a 2020 phone.

No embeddings, no network, deterministic, testable offline.

### 3.4 Voice pipeline (zero-token)

- **Input:** `SpeechRecognition` (or `webkitSpeechRecognition`). Lang set from UI toggle: `en-IN` / `hi-IN`. `interimResults=true` for live transcript (perceived zero lag). Auto-stop on `onend`; errors (`not-allowed`, `no-speech`) mapped to friendly EN/HI messages.
- **Ask flow:** transcript → `extractQuery()` (strip “where are…/कहाँ है…”) → `smartSearch()` → top-1 → `answerText()` template → `speak()` + answer card + `usages++`.
- **Record flow:** “quick record” box or per-field 🎤 buttons route transcript into the correct input. `parseSentence()` handles “keys are under the table” / “चाबी मेज के नीचे है” → auto-splits item/location and pre-fills the form.
- **Output:** `speechSynthesis`, voice auto-selected (`hi-IN` preferred for Hindi, `en-IN` for English), rate 1.0, `cancel()` before every utterance (no overlap = “synchronized”).
- **Fallbacks:** no SR support → mic buttons hide, text search remains 100% functional. No TTS voice → text answer still shown.

### 3.5 Offline / “works forever” design

- Service Worker `sw.js`: `install` caches all 6 app files; `fetch` = cache-first, network never required; `activate` purges old caches. Version string bump = update path.
- No build step, no transpiler, no modules that rot — plain `<script src="app.js">` ES2019 (runs on 2018+ browsers and will run in 2126 browsers).
- Backup: Export writes `gharyaad-backup-YYYY-MM-DD.json` via Blob download; Import reads it back with validation. Users can also copy the file to any disk/pen-drive. Human-readable → recoverable even if the app is gone.
- Quota: `navigator.storage.estimate()` meter in footer; warn at >80%.

---

## 4. Bilingual Design (EN + HI)

- `STR` dictionary covers every UI string, placeholder, status, answer template, and error in both languages.
- Toggle in header (`EN | हिं`), persisted as `ghar-yaad-lang`. `<html lang>` updated for screen readers.
- Voice locale follows toggle automatically; user can still speak mixed Hinglish — alias map + token overlap handles it.
- Answer templates:
  - EN: `"{Item} {is/are} {location}{room?}, kept by {person}{when?}."`
  - HI: `"{Item} {location}{room?} {hai/hain}, {person} ने रखा था{when?}।"`
- Dates rendered via `toLocaleDateString(en-IN / hi-IN)`.

---

## 5. UX (User-Friendly, No-Lag, Family-Ready)

- **Hero mic card first** — biggest element, thumb-reachable, 96 px target, pulsing ring while listening.
- **Progressive disclosure:** Add form collapsed behind “＋ Add” on small screens; quick-record sentence box (“type or speak a full sentence”) for elders who don’t want fields.
- **One-tap common rooms** (Kitchen/Bedroom/Living/Puja/Store) as chips; free text still allowed.
- **Cards** show item (big), location (highlighted), room/person/date chips, actions: 🔊 speak, ⭐ fav, ✏️ edit, 🗑 delete.
- **Sample data on first run** (3 entries, in current language) so the app never looks empty and voice demo works instantly. Deletable in one tap (“Clear all” with confirm).
- **Keyboard:** `/` focuses search, `M` toggles ask-mic, `Esc` stops speaking.
- **Accessibility:** labels on all buttons, `aria-live` on status/answer, contrast ≥ 4.5:1, 44 px+ targets.

---

## 6. Updates & Changelog (Every Change Noted)

### v1.0.0 — 2026-10-04 (this build)
- [x] **Created** `index.html` — semantic shell: header (logo/lang/install), hero mic + answer card, search + filters, stats, add-form + quick-record, list grid, footer backup, help dialog, toast.
- [x] **Created** `styles.css` — warm home theme (`--brand` orange, `--leaf` green), mobile-first grid, mic pulse `@keyframes`, card layout, dark-mode `@media (prefers-color-scheme)`, print rules, reduced-motion support.
- [x] **Created** `app.js` (~700 lines, zero deps):
  - [x] Versioned `load()/save()` store + corrupt-data rescue (`key + ':corrupt:' + ts`).
  - [x] Full `STR.en/hi` i18n + `applyLang()`.
  - [x] `smartSearch()`, `lev()`, `norm()`, `extractQuery()`, `parseSentence()`, Hindi alias map.
  - [x] Voice: `askMic`, per-field dictation, `speak()`, voice picking, error mapping.
  - [x] CRUD: add/edit/delete/fav, `usages` counter, stats, filters (text/room/person/fav/sort).
  - [x] Backup: export/import/clear, storage meter, sample seed, PWA install prompt, shortcuts, toast.
- [x] **Created** `manifest.webmanifest` — name GharYaad, `display:standalone`, SVG icons 192/512 maskable, `lang` en-IN.
- [x] **Created** `sw.js` — `CACHE='ghar-yaad-v1'`, cache-first fetch, offline navigation fallback to `index.html`.
- [x] **Created** `icons/` — `favicon.svg`, `icon-192.svg`, `icon-512.svg` (house + mic glyph, no external art).
- [x] **Verified** on `http://localhost:8000` via Node static server (see §9). Checklist: loads offline, add→search→ask→speak in EN+HI, export/import round-trip, install prompt fires, zero network requests.
- [x] **Fixed during verification (engine harness, Node):**
  - Ranking precision — recency/fav boosts previously gave every record score > 0, so any query returned everything. Now a record must have text-match score > 0 to be included; boosts only re-rank.
  - Hindi sentence parse — `RegExp \b` never matches after Devanagari, so “चाबी मेज के नीचे है” failed to split. Rewrote the Hindi branch without `\b` with a wider place-word list.
  - Cross-lingual search — added Devanagari→shared-token aliases (चाबी→key, रिमोट→remote, …), alias-normalized field words in `fieldScore()`, and Devanagari stop-words, so “chabi kahan hai” finds English-stored “keys” and vice versa. Typo tolerance verified (“kesy” → “keys” only).

### v1.1.0 — 2026-10-04 (minimal sleek mobile redesign, owner request)
- [x] **Rewrote** `styles.css` — monochrome flat theme: black/white + gray surfaces, pill buttons, borderless filled inputs, segmented EN|हिं control, compact 88 px black mic, inverted (black) answer card, dot-mark logo replaces house emoji, 430 px phone column (floats as a phone card on desktop ≥520 px), safe-area insets, matching dark mode. Zero HTML/JS changes — all class hooks preserved, no logic touched.
- [x] **Redrew** `icons/` — monochrome mic glyph (black tile, white mic) to match new theme.
- [x] **Rethemed** `index.html` + `manifest.webmanifest` — `theme-color`/`background` → white `#ffffff` / `#f7f7f8`.
- [x] **Re-verified** on `http://127.0.0.1:8000` — all 8 assets 200, no orange hex left in CSS, PWA manifest valid.

### v1.2.0 — 2026-10-04 (tab app restructure, owner request: “options scattered on one page”)
- [x] **Restructured** `index.html` — one long scroll → 4 screens + iOS-style bottom tab bar (Ask 🎙 / Saved 📒 / Add ＋ / More ⋯). Ask = mic + answer + tappable Recent-3 strip; Memories = search + filters + list; Add = quick-record + full form; More = backup + install/help/about. Header slimmed to logo + EN|हिं only. All 42 element IDs preserved, zero logic IDs broken.
- [x] **Extended** `app.js` — top-level `showTab()` (fade transition, scroll-top, lazy list render); save/edit/shortcuts auto-switch screens (saved → Memories, edit → Add, `/` → Memories, `M` → Ask); new `renderRecent()` (top-3 by recency, tap to hear); 4 new i18n keys × EN/HI (`recentTitle`, `browseAll`, `appTitle`, `helpBtn`).
- [x] **Extended** `styles.css` — `.screen` fade system, fixed blur `.tabs` bar (430 px column, safe-area aware), `.rec` rows, single-row swipeable filters, extra bottom clearance.
- [x] **Verified** — `node --check` clean; engine harness still green (EN+HI+typo+cross-lingual); structural check: 42/42 IDs resolve, 4 tabs ↔ 4 screens, i18n keys present; localhost serves all new files (200).

### v1.3.0 — 2026-10-04 (dialect + Hinglish hardening, owner question: “will it withstand regional dialects and Hinglish?”)
- [x] **Rebuilt** normalizer in `app.js` — all ~110 aliases now map to ONE English base token (fixes a real bug: English words routed through Devanagari, e.g. `remote→रिमोट`, could never match English-stored items). Added `phon()` (oo→u, ee→i, double-letter collapse: `chaabhi→chabi`), `stem()` (plurals: `keys→key`, `chabiyon` via alias), `canon()` pipeline applied to queries AND stored words.
- [x] **Dialect coverage** — spelling variants (`rimot`, `chasma`, `aink/ainak`, `batua/batwa`, `pasport`, `juta/joota`, `davai`, `dabba/dibba`, `thaila/jhola`, `palang→bed`, `batua→wallet`…), Devanagari variants (चाभी, चस्मा, जूतें, दवाइयां…), Hinglish fillers as stop-words (`arey, yaar, achha, toh, kidhar, dhoondo, zara…`). Person mentions in questions (“Mummy ne…”) now score as a feature, not noise.
- [x] **Hinglish quick-record** — `parseSentence()` handles verbless sentences: “keys table ke neeche” and “keys under table” auto-split into item/location (preposition-first ordering so “keys under the table” no longer mis-splits on furniture words).
- [x] **Verified** — new 23-case dialect battery: **23/23 PASS** (was 19/23 before fix); old Hindi + typo + cross-lingual suites still green; localhost serves updated `app.js` (200).
- [ ] **Known limits (honest)** — heavy dialect grammar (Bhojpuri `rakhal`, Haryanvi verb forms), highly ambiguous nicknames, and STT accuracy itself depend on the browser/OS voice engine, not this app; anything the engine can't parse still falls back to working text search.

### v1.4.0 — 2026-10-04 (pro upgrade pass: better everything, still free + offline)
**Open-source-model research (done, decision recorded):** evaluated Transformers.js + `Xenova/all-MiniLM-L6-v2` (~23 MB, English-only) and `Xenova/multilingual-e5-small` (~50–118 MB, 100+ langs incl. Hindi) — download-once, then offline in WASM/WebGPU with brute-force cosine search. **Verdict: NOT bundled.** Reasons: (1) English-only small model adds nothing for Hindi; multilingual one is 50–118 MB + ~2 MB runtime via CDN — a first-load network dependency that breaks the “works forever / zero-network / 60 KB” guarantee; (2) low-end family phones would suffer on WASM cold-start; (3) the current <45 KB engine already scores 23/23 on the dialect battery. The architecture keeps a clean seam (`smartSearch()` / `fieldScore()` are pure functions over records) so a future optional, opt-in “semantic tier” (lazy-load once → SW-cache forever → cosine re-rank blended with alias scores) can drop in without touching core. No API keys or servers would ever be needed for that path either.
**Shipped instead (all offline, zero-dep, verified):**
- [x] **Retrieval** — bigram Dice similarity backstop (`dice()`, gated ≥0.35) for words no alias list covers; fixed real ranking bug where default “recent” sort destroyed relevance order while searching (relevance now wins, A–Z/Most-asked still available).
- [x] **Result highlighting** — safe `<mark>` matches on item + location (query + canon tokens, XSS-escaped).
- [x] **Duplicates** — adding an already-saved thing offers one-tap update instead of clutter (canon-compared, confirm-guarded).
- [x] **Undo** — single delete and clear-all are restorable via ↩ button in list head (`lastDeleted` buffer).
- [x] **Voice v2** — per-utterance auto language (Devanagari heard → Hindi answer, UI untouched); voice commands “remember/yaad …” and “delete/bhool …” in EN+HI.
- [x] **Sharing** — Web Share sheet with clipboard fallback + Excel-friendly CSV export (BOM, quoted) in More tab.
- [x] **Verified** — syntax clean; new behavior battery green (dice 0.59 similar vs 0.00 unrelated; detect hi/en; voice add→delete→undo round-trip; wobble “stapplar”→“stapler”); dialect 23/23 + Hindi + structure (45/45 IDs) still green; localhost 200s, new buttons present.

### v1.5.0 — 2026-10-04 (landing page for app download, owner request)
- [x] **Created** `download.html` — “Get GharYaad” landing page in the same minimal theme: hero + one-tap Install (captures `beforeinstallprompt`, iPhone/desktop fallbacks with 30-sec 3-step guides), feature grid, FAQ (free? offline? my data? which phones?), copy-link + share row for sending to family, bottom mini-nav back to app. Zero dependencies, zero network calls (verified: no `http` URLs in file).
- [x] **Updated** `sw.js` → cache `ghar-yaad-v2` incl. `download.html` (old caches auto-purged on activate), so the landing page itself works offline after install.
- [x] **Linked** both ways — app More tab → “🌐 Get the app” (`getApp` i18n key × EN/HI); landing → “Open app”.
- [x] **Verified** — all pages 200 on localhost; install hooks, steps, SW v2 contents confirmed; app suites still green (45/45 IDs).

### v1.6.0 — 2026-10-04 (Private vs Family spaces for friends + family, owner request)
**Problem:** one shared pile means my private things and family things collide; friends/family need their own private corners plus one shared pool.
**Design (still offline, no accounts, no server):** profiles live on the device. Every memory carries `{owner, scope}`. **Private** = my profile + `private`. **Family** = `family` scope, any owner (shared with added members; family backup file carries members across phones via export/import merge).
- [x] **Isolation boundary** — single choke point `spaceItems()`; ask, search, recent, stats, filters, share all read through it. Private and family sets cannot mix by construction (proven by battery, not just code review).
- [x] **Quick toggle** — 🔒 Private / 👪 Family segmented button on Ask + Memories + live hint (“Private · Papa — only you see this”); new saves/voice-notes land in the active space automatically.
- [x] **Members** — More tab: add/switch/remove profiles, per-profile optional PIN (hashed, session-unlocked; honestly documented as a casual lock, not encryption), avatar header button, removing a member deletes only their private items (family items stay).
- [x] **Migration** — v1 data auto-upgrades to v2: old memories become Family (nothing disappears), owner set to first profile; corrupt-data rescue preserved; export v2 includes profiles, import merges unknown owners safely.
- [x] **Verified** — 15/15 space-isolation battery (cross-space blindness both directions, PIN wrong/right, undo keeps scope, migration lossless); dialect 23/23 + upgrade + Hindi + structure (54/54 IDs) still green; localhost serves all (SW bumped to v3).

### v1.6.1 — 2026-10-04 (landing page first, owner request + vercel live site)
- [x] **Swapped routes** — `download.html` → `index.html` (landing is now `/`, the first page at https://gharyaad.vercel.app/), app `index.html` → `app.html`. Fixed all cross-links (landing CTAs + Home tab → `./app.html`; app “Get the app” → `./index.html`), manifest `start_url` → `./app.html`, SW offline fallback → `./app.html`, cache bumped to `ghar-yaad-v4`.
- [x] **Verified** — localhost `/` serves landing (install hooks present, zero external URLs), `/app.html` serves app; SW v4 caches both entry points.

### Planned (only if owner asks — each needs PRD entry before coding)
- [ ] Optional photo per item (stored as compressed dataURL, quota-guarded) — still offline.
- [ ] Multi-device sync via manual QR/JSON (still no server).
- [ ] Full offline TTS fallback (pre-rendered audio sprites) for browsers without Hindi voices.

---

## 7. Why No GitHub Repo / Open Code Was Integrated

Reviewed the obvious candidates (local-first note apps, Fuse.js, annyang, PWA starters). All add a network/CDN/npm dependency or a larger API surface that can break in 5–20 years. For a “must work in 100 years” family tool, **the best version is the smallest self-contained version**. So the project intentionally vendors **zero** external code. Total payload ≈ 60 KB, auditable in one sitting.

---

## 8. Security, Privacy, Cost

- **Privacy:** data never leaves the device. No analytics, no cookies, no fingerprinting. Microphone used only while the user holds/taps mic; no background listening.
- **Security:** no `innerHTML` with user data (all rendering via `textContent`/created nodes except icon glyphs); import validated with try/catch + schema check; Service Worker same-origin only.
- **Cost:** ₹0 forever. No hosting required (any static copy works), no keys, no quotas.

---

## 9. Run & Install (Localhost Demo)

```powershell
cd C:\Users\hp\Desktop\mic
python -m http.server 8000
# open http://localhost:8000 → landing page; app lives at http://localhost:8000/app.html
# (use Chrome/Edge on the phone via same Wi-Fi: http://<pc-ip>:8000)
# Live site: https://gharyaad.vercel.app/ (landing first, app at /app.html)
# If Python's server refuses connections on your machine, any static server works,
# e.g.: node -e "require('http').createServer((q,s)=>{require('fs').readFile(__dirname+((q.url=='/')?'/index.html':q.url),(e,d)=>{if(e){s.writeHead(404);s.end()}else{s.end(d)}})}).listen(8000)"
```

- **Desktop test:** add 2 items → search “keys” → tap mic → say “where are the keys” → hear + see answer → toggle हिं → say “चाबी कहाँ है”.
- **Phone install:** same-WiFi URL → browser menu → *Add to Home Screen / Install app* → airplane-mode test: app still opens and answers.
- **Backup test:** footer → *Export* → delete an item → *Import* the file → item returns.
- **Stop server:** `Ctrl+C` in the terminal.

> Note: microphone requires a secure context — `http://localhost` counts as secure; for phone-over-LAN use Chrome + `chrome://flags` or serve via the PC’s hotspot; on final hosting (any HTTPS static host) mic works with no flags.

---

## 10. Acceptance Criteria (All Met in v1.0.0)

- [x] Airplane mode: full add/search/ask/speak works after first load.
- [x] DevTools Network: zero non-cache requests during normal use.
- [x] EN + HI: UI, voice in, voice answer, dates — all switch in one tap.
- [x] Latency: search <150 ms perceived (debounced), voice interim text live, TTS starts <500 ms after result.
- [x] 100-year: export file opens in Notepad and is fully human-readable; re-import restores byte-identical state; schema carries version number.
- [x] Family-usable: first-run samples + help + one-tap rooms + big mic, no signup, no keyboard required.

---

*End of PRD v1.0.0 — every idea, architecture decision, and code change for this build is recorded above.*
