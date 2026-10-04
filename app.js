/* ============================================================
   GharYaad v1.0 — 100% offline family memory keeper.
   Zero dependencies. Zero network calls. Zero API keys.
   Store (localStorage) + i18n (EN/HI) + fuzzy search + voice.
   ============================================================ */
'use strict';

/* ---------- constants ---------- */
const LS_KEY = 'ghar-yaad-v1';
const LANG_KEY = 'ghar-yaad-lang';
const $ = (id) => document.getElementById(id);

/* ---------- i18n ---------- */
const STR = {
  en: {
    tagline: 'Where is it? Just ask.', install: 'Install',
    tapAsk: 'Tap the mic and ask — “Where are the keys?”',
    listening: '🎧 Listening… speak now', thinking: '⚡ Thinking…',
    speaking: '🔊 Answering…', micError: 'Mic not available — type or search instead.',
    noSpeech: 'Did not hear you. Tap the mic and try again.',
    noMic: 'This browser has no voice input. Typing + search still work 100%.',
    quickRecord: '⚡ Quick record (speak or type one sentence)',
    saveMemory: 'Save ✓', quickHint: 'Tip: say “X is in Y” and we fill the form for you.',
    needBoth: 'Please tell both WHAT and WHERE. Example: Keys — under the table.',
    saved: '✅ Remembered!', deleted: 'Deleted.', updated: '✅ Updated!',
    findTitle: '🔍 Find it', favOnly: 'Favs', clear: 'Clear',
    sortRecent: 'Recent first', sortUsed: 'Most asked', sortAZ: 'A–Z',
    items: 'items', today: 'today', favs: 'favs',
    addTitle: '＋ Remember where something is',
    fItem: 'Thing *', fLoc: 'Kept where *', fRoom: 'Room', fPerson: 'Kept by', fNotes: 'Note (optional)',
    reset: 'Reset', remember: 'Remember this',
    savedTitle: '📒 Saved memories', clearAll: 'Clear all',
    confirmClear: 'Delete ALL memories? Export a backup first if unsure.',
    cleared: 'All memories cleared.', emptyMsg: 'Nothing here yet. Tap the mic or add your first memory above.',
    backupTitle: '🛡️ Forever backup (works for 100 years)',
    backupHint: 'Your data lives only on this device. Export a file to a pen-drive for safekeeping.',
    export: 'Export backup', import: 'Import', storage: 'Storage used',
    exported: '📤 Backup downloaded — keep it safe!', imported: '📥 Backup restored!',
    badFile: 'That file is not a GharYaad backup.', speakAgain: 'Speak again', stop: 'Stop',
    recentTitle: 'Recent', browseAll: 'See all →', appTitle: 'App', helpBtn: 'How to use', getApp: 'Get the app',
    private: 'Private', family: 'Family', members: 'Members',
    membersHint: 'Family sees everything saved in Family space. Private stays inside one profile only. A PIN is a casual lock, not encryption.',
    memberAdded: 'joined 👪', switchedTo: 'Switched to', youWord: 'you', switchWord: 'Switch profile',
    enterPin: 'Enter PIN', setPinFor: 'Set PIN for', pinSet: 'PIN set 🔒', wrongPin: 'Wrong PIN, try again', unlocked: 'Unlocked ✓',
    delMemberAsk: (n) => `Remove ${n}? Their private items go too. Family items stay.`,
    spacePrivateHint: (n) => `🔒 Private · ${n} — only you see this`,
    spaceFamilyHint: (n) => `👪 Family · ${n} member${n === 1 ? '' : 's'} see this`,
    undo: 'Undo', share: 'Share list', exportCsv: 'CSV',
    copied: 'Copied — paste anywhere 📋', csvDone: '📊 CSV downloaded',
    dupMsg: (i, l) => `“${i}” is already saved (${l}). Update it instead?`,
    delAsk: (i, l) => `Forget “${i}” (${l})?`,
    voiceAdded: (i) => `${i} remembered. ✅`, voiceGone: (i) => `${i} deleted.`,
    helpTitle: 'How to use 🙏', gotIt: 'Got it!', madeFor: 'made for family',
    foundNone: (q) => `Hmm, I don't know about “${q}” yet. Save it above and I'll remember forever.`,
    keptBy: 'kept by', allRooms: '🏠 All rooms', everyone: '👪 Everyone',
    rooms: ['Kitchen', 'Bedroom', 'Living room', 'Puja room', 'Store', 'Bathroom'],
    help: `<ol>
      <li><b>Save:</b> type “Keys — under the table” below, or speak one full sentence in the quick box.</li>
      <li><b>Ask:</b> tap the big mic and say <i>“Where are the keys?”</i> — GharYaad speaks the answer.</li>
      <li><b>Search:</b> just type <i>keys</i> or <i>चाबी</i> in the search bar. Typos are OK.</li>
      <li><b>Hindi:</b> tap <b>हिं</b> on top — voice, answers and dates all switch.</li>
      <li><b>Forever:</b> no internet needed after first open. Use <b>Export backup</b> for 100-year safety.</li>
      <li><b>Keys:</b> press <b>/</b> to search, <b>M</b> for mic, <b>Esc</b> to stop voice.</li></ol>`
  },
  hi: {
    tagline: 'सामान कहाँ है? बस पूछिए।', install: 'इंस्टॉल',
    tapAsk: 'माइक दबाइए और पूछिए — “चाबी कहाँ है?”',
    listening: '🎧 सुन रहे हैं… बोलिए', thinking: '⚡ सोच रहे हैं…',
    speaking: '🔊 जवाब दे रहे हैं…', micError: 'माइक उपलब्ध नहीं — लिखकर खोजें।',
    noSpeech: 'सुनाई नहीं दिया। माइक दबाकर फिर बोलिए।',
    noMic: 'इस ब्राउज़र में आवाज़ इनपुट नहीं है। लिखना + खोज पूरी तरह काम करेगा।',
    quickRecord: '⚡ जल्दी याद कराएँ (एक वाक्य बोलें या लिखें)',
    saveMemory: 'याद करो ✓', quickHint: 'सुझाव: “X Y में है” बोलिए, फॉर्म खुद भर जाएगा।',
    needBoth: 'कृपया चीज़ और जगह दोनों बताएँ। जैसे: चाबी — मेज़ के नीचे।',
    saved: '✅ याद कर लिया!', deleted: 'हटा दिया।', updated: '✅ बदल दिया!',
    findTitle: '🔍 खोजिए', favOnly: 'पसंद', clear: 'साफ़',
    sortRecent: 'नया पहले', sortUsed: 'ज़्यादा पूछा', sortAZ: 'अ–ज्ञ',
    items: 'चीज़ें', today: 'आज', favs: 'पसंद',
    addTitle: '＋ सामान कहाँ रखा है, याद कराएँ',
    fItem: 'चीज़ *', fLoc: 'कहाँ रखी *', fRoom: 'कमरा', fPerson: 'किसने रखी', fNotes: 'नोट (वैकल्पिक)',
    reset: 'रीसेट', remember: 'याद रखो',
    savedTitle: '📒 याद की हुई चीज़ें', clearAll: 'सब हटाएँ',
    confirmClear: 'सारी यादें हटाएँ? पहले बैकअप ले लीजिए।',
    cleared: 'सब साफ़ कर दिया।', emptyMsg: 'अभी कुछ नहीं है। माइक दबाइए या ऊपर पहली याद जोड़िए।',
    backupTitle: '🛡️ हमेशा का बैकअप (100 साल के लिए)',
    backupHint: 'आपका डेटा सिर्फ़ इसी फ़ोन में है। पेन-ड्राइव में फ़ाइल रख लीजिए।',
    export: 'बैकअप लें', import: 'वापस लाएँ', storage: 'इस्तेमाल स्टोरेज',
    exported: '📤 बैकअप डाउनलोड हो गया — संभालकर रखिए!', imported: '📥 बैकअप वापस आ गया!',
    badFile: 'यह GharYaad बैकअप फ़ाइल नहीं है।', speakAgain: 'फिर सुनें', stop: 'रोकें',
    recentTitle: 'ताज़ा', browseAll: 'सब देखें →', appTitle: 'ऐप', helpBtn: 'कैसे इस्तेमाल करें', getApp: 'ऐप लीजिए',
    private: 'निजी', family: 'परिवार', members: 'सदस्य',
    membersHint: 'Family में जो है वो सब देखेंगे। Private सिर्फ़ इसी प्रोफ़ाइल में रहेगा। PIN मामूली ताला है, सुरक्षा-कवच नहीं।',
    memberAdded: 'जुड़ गए 👪', switchedTo: 'बदल गए:', youWord: 'आप', switchWord: 'प्रोफ़ाइल बदलें',
    enterPin: 'PIN डालें', setPinFor: 'PIN रखें:', pinSet: 'PIN लग गया 🔒', wrongPin: 'गलत PIN, फिर कोशिश करें', unlocked: 'खुल गया ✓',
    delMemberAsk: (n) => `${n} हटाएँ? उनकी निजी चीज़ें भी जाएँगी। Family वाली रहेंगी।`,
    spacePrivateHint: (n) => `🔒 Private · ${n} — सिर्फ़ आप देख सकते हैं`,
    spaceFamilyHint: (n) => `👪 Family · ${n} सदस्य देख सकते हैं`,
    undo: 'वापस लाओ', share: 'सूची भेजें', exportCsv: 'CSV',
    copied: 'कॉपी हो गया — कहीं भी भेजें 📋', csvDone: '📊 CSV डाउनलोड हो गया',
    dupMsg: (i, l) => `“${i}” पहले से है (${l})। बदल दूँ?`,
    delAsk: (i, l) => `“${i}” (${l}) भुला दूँ?`,
    voiceAdded: (i) => `${i} याद कर लिया। ✅`, voiceGone: (i) => `${i} हटा दिया।`,
    helpTitle: 'कैसे इस्तेमाल करें 🙏', gotIt: 'समझ गए!', madeFor: 'परिवार के लिए',
    foundNone: (q) => `हम्म, “${q}” के बारे में अभी पता नहीं। ऊपर सहेज दीजिए, हमेशा याद रखूँगा।`,
    keptBy: 'रखा', allRooms: '🏠 सारे कमरे', everyone: '👪 सभी',
    rooms: ['रसोई', 'बेडरूम', 'बैठक', 'पूजा घर', 'स्टोर', 'बाथरूम'],
    help: `<ol>
      <li><b>सहेजें:</b> नीचे “चाबी — मेज़ के नीचे” लिखें, या जल्दी वाले डिब्बे में पूरा वाक्य बोलें।</li>
      <li><b>पूछें:</b> बड़ा माइक दबाकर बोलें <i>“चाबी कहाँ है?”</i> — जवाब सुनाई देगा।</li>
      <li><b>खोजें:</b> बस <i>चाबी</i> या <i>keys</i> लिखें। ग़लत स्पेलिंग भी चलेगी।</li>
      <li><b>English:</b> ऊपर <b>EN</b> दबाएँ — आवाज़, जवाब, तारीख़ सब बदल जाएगा।</li>
      <li><b>हमेशा:</b> पहली बार खुलने के बाद इंटरनेट नहीं चाहिए। <b>बैकअप लें</b> से 100 साल सुरक्षित।</li>
      <li><b>कीबोर्ड:</b> <b>/</b> से खोज, <b>M</b> से माइक, <b>Esc</b> से आवाज़ बंद।</li></ol>`
  }
};

/* dialect + Hinglish normalizer: every variant (roman/devanagari/misspelling)
   maps to ONE english base token, so all spellings match all spellings. */
const ALIAS = {
  keys: 'key', chabi: 'key', chabhi: 'key', chaabhi: 'key', chaabi: 'key',
  chabiyan: 'key', chabiyon: 'key',
  'चाबी': 'key', 'चाबियां': 'key', 'चाभी': 'key',
  rimot: 'remote', rimoat: 'remote', 'रिमोट': 'remote',
  purse: 'wallet', pers: 'wallet', batua: 'wallet', batwa: 'wallet',
  'पर्स': 'wallet', 'बटुआ': 'wallet',
  chasma: 'specs', chashma: 'specs', chashme: 'specs', ainak: 'specs', aink: 'specs',
  'चश्मा': 'specs', 'चश्में': 'specs', 'चस्मा': 'specs', 'ऐनक': 'specs',
  juta: 'shoes', joota: 'shoes', joote: 'shoes', jute: 'shoes', jutte: 'shoes',
  'जूते': 'shoes', 'जूता': 'shoes', 'जूतें': 'shoes',
  mobile: 'phone', 'फ़ोन': 'phone', 'फोन': 'phone', 'मोबाइल': 'phone',
  'चार्जर': 'charger',
  davai: 'medicine', dawai: 'medicine', dawaai: 'medicine',
  'दवाई': 'medicine', 'दवा': 'medicine', 'दवाइयां': 'medicine',
  paisa: 'money', paise: 'money', pesse: 'money', 'पैसे': 'money', 'पैसा': 'money',
  kagaz: 'papers', kagad: 'papers', kaagaz: 'papers', 'काग़ज़': 'papers', 'कागज': 'papers',
  pasport: 'passport', 'पासपोर्ट': 'passport',
  mez: 'table', mej: 'table', meiz: 'table', 'मेज़': 'table', 'मेज': 'table', 'टेबल': 'table',
  almirah: 'almari', 'अलमारी': 'almari',
  rasoi: 'kitchen', rasoee: 'kitchen', 'रसोई': 'kitchen',
  baithak: 'living', 'बैठक': 'living',
  kamra: 'room', kamara: 'room', 'कमरा': 'room',
  bistar: 'bed', palang: 'bed', 'बिस्तर': 'bed', 'पलंग': 'bed',
  sofe: 'sofa', 'सोफ़ा': 'sofa', 'सोफा': 'sofa',
  daraz: 'drawer', daraaz: 'drawer', 'दराज़': 'drawer', 'दराज': 'drawer',
  dabba: 'box', dibba: 'box', dibbaa: 'box', 'डिब्बा': 'box',
  thaila: 'bag', thela: 'bag', thaili: 'bag', jhola: 'bag',
  'थैला': 'bag', 'थैली': 'bag', 'झोला': 'bag',
  bartan: 'vessel', 'बर्तन': 'vessel',
  kapde: 'clothes', kapda: 'clothes', kapdon: 'clothes', 'कपड़े': 'clothes', 'कपड़ा': 'clothes',
  nichee: 'under', neeche: 'under', niche: 'under', 'नीचे': 'under',
  uper: 'top', upar: 'top', oopar: 'top', 'ऊपर': 'top',
  andar: 'inside', 'अंदर': 'inside',
  baahar: 'outside', bahar: 'outside', 'बाहर': 'outside'
};
/* spelling/phonetic/grammatical collapsing, applied to queries AND stored words */
function phon(w) {
  if (!w || /[\u0900-\u097F]/.test(w)) return w;
  return w.replace(/oo/g, 'u').replace(/ee/g, 'i').replace(/(.)\1+/g, '$1');
}
function stem(w) {
  if (!w || w.length < 4 || /[\u0900-\u097F]/.test(w)) return w;
  if (w.endsWith('ies')) return w.slice(0, -3) + 'y';
  if (w.endsWith('es') && w.length > 5) return w.slice(0, -2);
  if (w.endsWith('s') && !w.endsWith('ss')) return w.slice(0, -1);
  return w;
}
function canon(w) {
  if (!w) return w;
  const p = phon(w);
  return stem(ALIAS[p] || ALIAS[w] || p);
}
const STOP = new Set(('where,is,are,the,a,an,my,our,kept,keep,put,find,tell,me,please,show,do,you,know,hai,hain,he,ho,ki,ke,ka,kahan,kaha,kahaan, batao,bataye,rakha,rakhi,rakhe,hui,mein,men,main,par,per,se,ko,kaun,meri,mera,hamari,kya,cheez,saman,arre,arey,yaar,achha,acha,accha,aacha,toh,abhi,ab,kidhar,dhoondo,dhundho,dekho,lao,nikalo,zara,thoda,कहाँ,कहां,कहा,किधर,है,हैं,हूँ,का,के,की,में,मैं,पर,से,को,ने,मेरी,मेरा,हमारी,बताओ,बताइए,बताये,रखा,रखी,रखे,रखा,हुई,हुआ,सामान,चीज,चीज़,क्या,कौन,वाला,वाली,जो,यह,ये,वह,वो').split(','));

/* ---------- state ---------- */
let items = [];
let profiles = [];            /* [{id, name, pinHash}] — people on this device */
let activeProfileId = null;
let activeSpace = 'family';   /* 'private' (mine only) | 'family' (shared) */
let unlocked = new Set();     /* profile ids PIN-unlocked this session */
let pinPending = null;        /* {type:'space'|'profile'|'setpin', value, name} */
let lang = localStorage.getItem(LANG_KEY) || 'en';
let editingId = null, favOnly = false, lastAnswer = '', lastQuery = '';
let recog = null, listening = false;
let lastDeleted = null; /* undo buffer: { items: [...] } */

/* ---------- store (v2: profiles + owner/scope) ---------- */
function load() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) { seed(); return; }
    const data = JSON.parse(raw);
    items = Array.isArray(data.items) ? data.items : [];
    profiles = Array.isArray(data.profiles) ? data.profiles.filter((p) => p && p.id && p.name) : [];
    if (!profiles.length) {
      profiles = [{ id: uid(), name: lang === 'hi' ? 'मैं' : 'Me', pinHash: '' }];
      /* v1 → v2 migration: everything you saved stays visible in Family space */
      items.forEach((m) => { m.owner = m.owner || profiles[0].id; m.scope = m.scope || 'family'; });
    } else {
      const ids = new Set(profiles.map((p) => p.id));
      items.forEach((m) => {
        if (!ids.has(m.owner)) m.owner = profiles[0].id;
        if (m.scope !== 'private' && m.scope !== 'family') m.scope = 'family';
      });
    }
    if (!profiles.find((p) => p.id === data.activeProfileId)) data.activeProfileId = profiles[0].id;
    activeProfileId = data.activeProfileId;
    activeSpace = data.activeSpace === 'private' ? 'private' : 'family';
  } catch (e) {
    try {
      localStorage.setItem(LS_KEY + ':corrupt:' + Date.now(), localStorage.getItem(LS_KEY) || '');
    } catch (_) {}
    items = [];
  }
}
function save() {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify({ v: 2, items, profiles, activeProfileId, activeSpace, savedAt: Date.now() }));
  } catch (e) { toast('Storage full — export a backup, then delete old items.'); }
  renderStats(); renderMeter();
}
function seed() {
  profiles = [{ id: uid(), name: lang === 'hi' ? 'मैं' : 'Me', pinHash: '' }];
  activeProfileId = profiles[0].id; activeSpace = 'family';
  const now = Date.now(), D = 864e5, me0 = profiles[0].id;
  const base = (o) => Object.assign({ id: uid(), owner: me0, scope: 'family', fav: false, usages: 0 }, o);
  items = lang === 'hi' ? [
    base({ item: 'चाबी', location: 'मेज़ के नीचे', room: 'बैठक', person: 'पापा', notes: '', fav: true, usages: 2, createdAt: now - 2 * D, updatedAt: now - 1 * D }),
    base({ item: 'रिमोट', location: 'सोफ़े के पास टोकरी में', room: 'बैठक', person: 'मम्मी', notes: '', fav: false, usages: 1, createdAt: now - 3 * D, updatedAt: now - 2 * D }),
    base({ item: 'पासपोर्ट', location: 'अलमारी के ऊपर वाले खाने में', room: 'बेडरूम', person: 'बेटा', notes: 'नीले फ़ोल्डर में', fav: true, createdAt: now - 5 * D, updatedAt: now - 5 * D })
  ] : [
    base({ item: 'keys', location: 'under the table', room: 'living room', person: 'Papa', notes: 'blue keychain', fav: true, usages: 2, createdAt: now - 2 * D, updatedAt: now - 1 * D }),
    base({ item: 'remote', location: 'in the basket near the sofa', room: 'living room', person: 'Mummy', notes: '', fav: false, usages: 1, createdAt: now - 3 * D, updatedAt: now - 2 * D }),
    base({ item: 'passport', location: 'top shelf of the almari', room: 'bedroom', person: 'Son', notes: 'in blue folder', fav: true, createdAt: now - 5 * D, updatedAt: now - 5 * D })
  ];
  save();
}
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
const t = (k) => (STR[lang] && STR[lang][k]) || STR.en[k] || k;

/* ---------- private / family spaces ----------
   THE isolation rule: every read path goes through spaceItems().
   Private = my profile + scope 'private'. Family = scope 'family' (any owner).
   The two sets can never mix because no other function touches `items` for reads. */
const me = () => profiles.find((p) => p.id === activeProfileId) || profiles[0] || { id: '', name: '?' };
function spaceItems() {
  if (activeSpace === 'family') return items.filter((m) => m.scope === 'family');
  const id = me().id;
  return items.filter((m) => m.scope === 'private' && m.owner === id);
}
/* casual (non-crypto) PIN hash — keeps honest siblings out, documented as such */
function hashPin(s) {
  let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
  const str = 'gharYaad::' + s;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761); h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (h2 >>> 0).toString(36) + (h1 >>> 0).toString(36);
}
function renderAll() { renderRooms(); renderList(); renderStats(); renderMembers(); renderSpaceToggles(); }
function setSpace(s) {
  if (s !== 'private' && s !== 'family') return;
  const m = me();
  if (s === 'private' && m.pinHash && !unlocked.has(m.id)) return askPin('space', s, m.name);
  activeSpace = s; save(); renderSpaceToggles(); renderList(); renderStats();
}
function switchProfile(id) {
  const p = profiles.find((x) => x.id === id);
  if (!p || id === activeProfileId) return;
  if (p.pinHash && !unlocked.has(id)) return askPin('profile', id, p.name);
  activeProfileId = id; save(); renderAll();
  toast(`${t('switchedTo')} ${p.name}`);
}
function askPin(type, value, name) {
  pinPending = { type, value };
  $('pinWho').textContent = `${t('enterPin')}: ${name}`;
  $('pinInput').value = '';
  const d = $('pinDialog');
  if (d.showModal) d.showModal(); else { const v = prompt(`${t('enterPin')}: ${name}`); pinVerify(v || ''); return; }
  setTimeout(() => $('pinInput').focus(), 50);
}
function pinVerify(v) {
  if (!pinPending) return;
  const pend = pinPending; pinPending = null;
  if (pend.type === 'setpin') {
    const p = profiles.find((x) => x.id === pend.value);
    if (p && v) { p.pinHash = hashPin(v); save(); renderMembers(); toast(t('pinSet')); }
    return;
  }
  const id = pend.type === 'profile' ? pend.value : me().id;
  const p = profiles.find((x) => x.id === id);
  if (p && p.pinHash && hashPin(v) === p.pinHash) {
    unlocked.add(id);
    if (pend.type === 'profile') { activeProfileId = id; }
    else { activeSpace = 'private'; }
    save(); renderAll(); toast(t('unlocked'));
  } else toast(t('wrongPin'));
}
function renderSpaceToggles() {
  const m = me();
  document.querySelectorAll('.space-btn').forEach((b) => {
    b.classList.toggle('active', b.dataset.space === activeSpace);
  });
  document.querySelectorAll('.spaceHint').forEach((el) => {
    el.textContent = activeSpace === 'private'
      ? t('spacePrivateHint')(m.name)
      : t('spaceFamilyHint')(profiles.length);
  });
  const pb = $('profileBtn');
  if (pb) pb.textContent = (m.name || '?').trim().charAt(0).toUpperCase() || '?';
}
function renderMembers() {
  const box = $('memberList');
  if (!box) return;
  box.innerHTML = '';
  for (const p of profiles) {
    const row = document.createElement('div'); row.className = 'memb';
    const av = document.createElement('span'); av.className = 'avatar';
    av.textContent = (p.name || '?').trim().charAt(0).toUpperCase();
    const nm = document.createElement('div'); nm.className = 'memb-name';
    nm.textContent = p.name + (p.id === activeProfileId ? ` • ${t('youWord')}` : '') + (p.pinHash ? ' 🔒' : '');
    const acts = document.createElement('div'); acts.className = 'mem-actions';
    const mk = (txt, title, fn) => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'iconbtn'; b.textContent = txt; b.title = title; b.setAttribute('aria-label', title);
      b.onclick = fn; return b;
    };
    if (p.id !== activeProfileId) acts.append(mk('⇄', t('switchWord'), () => switchProfile(p.id)));
    acts.append(mk('🔒', 'PIN', () => {
      pinPending = { type: 'setpin', value: p.id };
      $('pinWho').textContent = `${t('setPinFor')}: ${p.name}`;
      $('pinInput').value = '';
      const d = $('pinDialog');
      if (d.showModal) d.showModal(); else { const v = prompt(`${t('setPinFor')}: ${p.name}`); pinVerify(v || ''); return; }
    }));
    if (profiles.length > 1) acts.append(mk('🗑', t('clearAll'), () => {
      if (!confirm(t('delMemberAsk')(p.name))) return;
      profiles = profiles.filter((x) => x.id !== p.id);
      lastDeleted = { items: items.filter((m) => m.owner === p.id && m.scope === 'private') };
      items = items.filter((m) => !(m.owner === p.id && m.scope === 'private'));
      if (activeProfileId === p.id) activeProfileId = profiles[0].id;
      save(); renderAll(); toast(t('deleted'));
    }));
    row.append(av, nm, acts); box.appendChild(row);
  }
}

/* ---------- text engine ---------- */
function norm(s) {
  return (s || '').toLowerCase().replace(/[?!।.,;:"'‘’“”()[\]{}<>|/\\\-_+=*~`@#$%^&]/g, ' ').replace(/\s+/g, ' ').trim();
}
function tokens(s) {
  return norm(s).split(' ').filter(Boolean).map(canon).filter((w) => !STOP.has(w) && w.length > 0);
}
/* Levenshtein, tiny + fast */
function lev(a, b) {
  if (a === b) return 0;
  if (!a.length) return b.length; if (!b.length) return a.length;
  if (Math.abs(a.length - b.length) > 2) return 3;
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[a.length][b.length];
}
/* character-bigram similarity — catches unknown words + transliteration wobble
   that no alias list can cover (e.g. "stapplar" vs "stapler", "mez" vs "mej") */
function dice(a, b) {
  if (!a || !b) return 0;
  if (a === b) return 1;
  const grams = (s) => {
    const t = ' ' + s + ' ', out = [];
    for (let i = 0; i < t.length - 1; i++) out.push(t.slice(i, i + 2));
    return out;
  };
  const A = grams(a), B = grams(b);
  if (!A.length || !B.length) return 0;
  const cnt = new Map();
  for (const g of A) cnt.set(g, (cnt.get(g) || 0) + 1);
  let hit = 0;
  for (const g of B) { const c = cnt.get(g) || 0; if (c > 0) { hit++; cnt.set(g, c - 1); } }
  return (2 * hit) / (A.length + B.length);
}
function fieldScore(field, qt) {
  if (!field || !qt) return 0;
  const f = norm(field), q = norm(qt);
  if (f === q) return 100;
  if (f.startsWith(q)) return 80;
  if (f.includes(q)) return 60;
  /* canon-normalized word comparison (dialects + Hinglish collapse both sides) */
  const ft = norm(field).split(' ').filter(Boolean).map(canon);
  const qq = canon(q);
  let best = 0;
  for (const w of ft) {
    if (w === qq) best = Math.max(best, 70);
    else if (w.startsWith(qq) || qq.startsWith(w)) best = Math.max(best, 45);
    else if (lev(w, qq) <= 2 && Math.min(w.length, qq.length) >= 3) best = Math.max(best, 35);
  }
  /* fuzzy backstop for words the alias map never saw (gated to avoid noise) */
  if (best < 35 && qq.length >= 3) {
    const dz = dice(f, qq);
    if (dz >= 0.35) best = Math.max(best, dz * 55);
  }
  return best;
}
function smartSearch(rawQuery, pool) {
  const qs = tokens(rawQuery);
  const base = pool || spaceItems();
  if (!qs.length) return [...base].sort((a, b) => b.updatedAt - a.updatedAt);
  const now = Date.now(), WEEK = 7 * 864e5;
  return base
    .map((m) => {
      let text = 0;
      const hay = [m.item, m.location, m.room, m.person, m.notes];
      for (const q of qs) {
        text += fieldScore(m.item, q) * 2 + fieldScore(m.location, q) * 1.2 +
             fieldScore(m.room, q) + fieldScore(m.person, q) + fieldScore(m.notes, q) * 0.6;
        if (norm(m.item).includes(norm(q)) || norm(q).includes(norm(m.item))) text += 10;
      }
      if (text <= 0) return { m, s: 0 };
      let s = text;
      if (m.fav) s += 6;
      s += Math.min(m.usages || 0, 10);
      if (now - m.updatedAt < WEEK) s += 4;
      return { m, s };
    })
    .filter((r) => r.s > 0)
    .sort((a, b) => b.s - a.s || b.m.updatedAt - a.m.updatedAt)
    .map((r) => r.m);
}
/* "where are the keys" / "चाबी कहाँ है" → "keys" / "चाबी" */
function extractQuery(speech) {
  let s = norm(speech);
  const cut = ['where is', 'where are', 'where is my', 'where are my', 'find my', 'find the',
    'kahan hai', 'kahaan hai', 'kaha hai', 'kahan he', 'kahan rakha', 'kaha rakha'];
  for (const c of cut) if (s.startsWith(c)) { s = s.slice(c.length); break; }
  const toks = tokens(s);
  return toks.join(' ') || norm(speech);
}
/* "keys are under the table" → {item, location}; "चाबी मेज के नीचे है" → {...} */
function parseSentence(s) {
  const raw = (s || '').trim();
  if (!raw) return null;
  const hi = /[\u0900-\u097F]/.test(raw);
  const parts = raw.split(/\s+(?:hai|hain|है|हैं)\s*$/i);
  const core = parts[0];
  const seps = hi
    ? [/(.+?)\s+(मेज़?|मेज|टेबल|अलमारी|रसोई|कमरे|बैठक|दराज|सोफ़ा|सोफा|बिस्तर|थैला|डिब्बा|शेल्फ|खाना|दराज़)(.*)/]
    : [/(.+?)\s+(?:is|are)\s+(?:kept\s+)?(?:in|on|under|inside|behind|near|at|within)\s+(.+)/i,
       /(.+?)\s*[-–:—]\s*(.+)/, /(.+?)\s+(?:is|are)\s+(.+)/i];
  for (const rx of seps) {
    const m = core.match(rx);
    if (m) {
      const item = m[1].replace(/^(my|the|meri|mera|हमारी)\s+/i, '').trim();
      let loc = hi ? (m[2] + (m[3] || '')).trim() : m[2].trim();
      if (item && loc) return { item, location: loc };
    }
  }
  if (!hi) {
    /* Hinglish / verbless: "keys under table" first (preposition beats furniture split) */
    const m2 = core.match(/^(.+?)\s+(under|inside|behind|near|beside|on|in|at)\s+(.+)$/i);
    if (m2 && m2[1].trim() && m2[3].trim()) return { item: m2[1].trim(), location: (m2[2] + ' ' + m2[3]).trim() };
    /* "keys table ke neeche", "chabhi mez me" */
    const furn = ['table', 'mez', 'mej', 'almari', 'almirah', 'sofa', 'sofe', 'bed', 'bistar',
      'rasoi', 'kitchen', 'drawer', 'daraz', 'dabba', 'dibba', 'box', 'bag', 'thaila',
      'shelf', 'fridge', 'kamra', 'room', 'cupboard', 'store'];
    const words = core.split(/\s+/);
    const fi = words.findIndex((w) => furn.includes(norm(w)));
    if (fi > 0) {
      const item = words.slice(0, fi).join(' ').replace(/^(my|the|meri|mera)\s+/i, '').trim();
      const loc = words.slice(fi).join(' ').trim();
      if (item && loc) return { item, location: loc };
    }
  }
  return null;
}
function whenText(ts) {
  const d = new Date(ts);
  try { return d.toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-IN', { day: 'numeric', month: 'short' }); }
  catch (e) { return d.toLocaleDateString(); }
}
function answerText(m, force) {
  const L = force || lang;
  const item = cap(m.item), loc = m.location;
  const room = m.room ? (L === 'hi' ? ` (${m.room})` : ` in the ${m.room}`) : '';
  const who = m.person ? (L === 'hi' ? `, ${m.person} ने ${whenText(m.updatedAt)} को रखा था` : `, kept by ${m.person} on ${whenText(m.updatedAt)}`) : '';
  return L === 'hi' ? `${item} ${loc}${room} है${who}।` : `${item} ${/^(is|are)\b/i.test(loc) ? '' : 'is '}${loc}${room}${who}.`;
}
const cap = (s) => (s || '').replace(/^\p{L}/u, (c) => c.toUpperCase());

/* ---------- voice ---------- */
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
function setMicUI(on, msg) {
  $('micBtn').classList.toggle('listening', !!on);
  if (msg) $('micState').textContent = msg;
}
/* per-utterance language: Devanagari heard → answer in Hindi, else follow toggle */
function detectLang(s) { return /[\u0900-\u097F]/.test(s || '') ? 'hi' : lang; }
function speak(text, force) {
  try {
    const L = force || lang;
    const synth = window.speechSynthesis;
    if (!synth) return;
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = L === 'hi' ? 'hi-IN' : 'en-IN';
    u.rate = 1; u.pitch = 1;
    const vs = synth.getVoices();
    const pick = vs.find((v) => v.lang && v.lang.toLowerCase().startsWith(L === 'hi' ? 'hi' : 'en-in')) ||
                 vs.find((v) => v.lang && v.lang.toLowerCase().startsWith('en'));
    if (pick) u.voice = pick;
    u.onstart = () => setMicUI(false, t('speaking'));
    u.onend = () => setMicUI(false, t('tapAsk'));
    synth.speak(u);
  } catch (e) {}
}
function listenOnce({ targetInput = null, onFinal = null } = {}) {
  if (!SR) { toast(t('noMic')); if (onFinal) onFinal(''); return; }
  try { window.speechSynthesis && window.speechSynthesis.cancel(); } catch (e) {}
  if (recog) { try { recog.abort(); } catch (e) {} }
  recog = new SR();
  recog.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';
  recog.interimResults = true; recog.maxAlternatives = 1;
  listening = true; setMicUI(true, t('listening'));
  let final = '';
  recog.onresult = (e) => {
    let interim = '';
    for (let i = e.resultIndex; i < e.results.length; i++) {
      const tr = e.results[i][0].transcript;
      if (e.results[i].isFinal) final += tr + ' ';
      else interim += tr;
    }
    const show = (final + interim).trim();
    if (targetInput) targetInput.value = show;
    else $('transcript').textContent = '“' + show + '”';
  };
  recog.onerror = (e) => {
    listening = false; setMicUI(false);
    if (e.error === 'not-allowed' || e.error === 'service-not-allowed') toast(t('micError'));
    else if (e.error === 'no-speech') toast(t('noSpeech'));
  };
  recog.onend = () => {
    listening = false; setMicUI(false, t('thinking'));
    const text = (final || (targetInput ? targetInput.value : $('transcript').textContent.replace(/[“”]/g, '')) || '').trim();
    if (onFinal) onFinal(text);
    setTimeout(() => { if (!lastAnswer) setMicUI(false, t('tapAsk')); }, 600);
  };
  try { recog.start(); } catch (e) { listening = false; }
}
function stopAll() {
  try { recog && recog.abort(); } catch (e) {}
  try { window.speechSynthesis && window.speechSynthesis.cancel(); } catch (e) {}
  listening = false; setMicUI(false, t('tapAsk'));
}

/* ask flow: voice commands → query → answer + speak (auto-language per turn) */
function askSpoken(speechText) {
  const low = norm(speechText);
  if (/^(remember|yaad|note|likh|likho|add)\b/.test(low) || /^yaad (rakho|kar)/.test(low)) {
    const sent = speechText.replace(/^(remember|yaad( rakho| karo?)?|note( karo)?|likho?|add)\b\s*/i, '');
    return voiceRemember(sent);
  }
  if (/^(delete|remove|bhool|bhul|hata|mita)\b/.test(low)) {
    const sent = speechText.replace(/^(delete|remove|bhool (jao)?|bhul (jao)?|hatao?|mitao?)\b\s*/i, '');
    return voiceDelete(sent);
  }
  const sl = detectLang(speechText);
  const q = extractQuery(speechText);
  lastQuery = q;
  const hits = smartSearch(q);
  const card = $('answerCard');
  if (!hits.length) {
    lastAnswer = t('foundNone')(q || speechText);
    $('answerText').textContent = '🤷 ' + lastAnswer;
    $('answerMeta').textContent = '';
  } else {
    const m = hits[0];
    m.usages = (m.usages || 0) + 1; m.updatedAt = Math.max(m.updatedAt, Date.now());
    save();
    lastAnswer = answerText(m, sl);
    $('answerText').textContent = '💡 ' + lastAnswer;
    const extra = hits.length - 1;
    $('answerMeta').textContent =
      `${sl === 'hi' ? 'संबंधित' : 'Also'}: ` + hits.slice(1, 4).map((x) => `${cap(x.item)} → ${x.location}`).join(' · ') +
      (extra > 3 ? ` (+${extra - 3})` : '') + (m.person ? `  •  👤 ${m.person}` : '');
    renderList();
  }
  card.classList.remove('hidden');
  speak(lastAnswer, sl);
  card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}
/* "remember keys are under the table" / "yaad karo chabi mez me hai" */
function voiceRemember(sent) {
  const sl = detectLang(sent);
  const p = parseSentence(sent);
  if (p && p.item && p.location) {
    items.unshift({ id: uid(), owner: me().id, scope: activeSpace, item: p.item, location: p.location, room: '', person: '', notes: sent, fav: false, usages: 0, createdAt: Date.now(), updatedAt: Date.now() });
    save(); renderRooms(); renderList();
    lastAnswer = t('voiceAdded')(cap(p.item));
    $('answerText').textContent = '✅ ' + lastAnswer; $('answerMeta').textContent = '';
    $('answerCard').classList.remove('hidden');
    speak(lastAnswer, sl);
  } else {
    fillForm({ item: sent, location: '', room: '', person: '', notes: '' });
    showTab('add'); toast(t('needBoth'));
  }
}
/* "delete keys" / "chabi bhool jao" */
function voiceDelete(sent) {
  const sl = detectLang(sent);
  const hits = smartSearch(extractQuery(sent));
  if (!hits.length) {
    lastAnswer = t('foundNone')(sent);
    $('answerText').textContent = '🤷 ' + lastAnswer; $('answerMeta').textContent = '';
    $('answerCard').classList.remove('hidden');
    speak(lastAnswer, sl); return;
  }
  const m = hits[0];
  if (confirm(t('delAsk')(cap(m.item), m.location))) {
    lastDeleted = { items: [m] };
    items = items.filter((x) => x.id !== m.id);
    save(); renderRooms(); renderList();
    lastAnswer = t('voiceGone')(cap(m.item));
    $('answerText').textContent = '🗑 ' + lastAnswer; $('answerMeta').textContent = '';
    $('answerCard').classList.remove('hidden');
    speak(lastAnswer, sl);
  }
}

/* ---------- render ---------- */
function toast(msg) {
  const el = $('toast');
  el.textContent = msg; el.classList.remove('hidden');
  clearTimeout(el._h); el._h = setTimeout(() => el.classList.add('hidden'), 2600);
}
function applyLang() {
  document.documentElement.lang = lang === 'hi' ? 'hi' : 'en';
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const v = t(el.dataset.i18n);
    if (typeof v === 'string') el.textContent = v;
  });
  $('langEn').classList.toggle('active', lang === 'en');
  $('langHi').classList.toggle('active', lang === 'hi');
  $('tagline').textContent = t('tagline');
  $('roomFilter').options[0].textContent = t('allRooms');
  $('personFilter').options[0].textContent = t('everyone');
  $('quickInput').placeholder = lang === 'hi' ? 'जैसे: चाबी मेज़ के नीचे है' : 'e.g. Keys are under the table / चाबी मेज़ के नीचे है';
  $('searchInput').placeholder = lang === 'hi' ? 'खोजें — चाबी, पासपोर्ट… ( / दबाएँ )' : 'Search — keys, चाबी, passport…  ( press / )';
  $('helpBody').innerHTML = t('help');
  renderAll();
}
function roomOptions() {
  const set = new Map();
  t('rooms').forEach((r) => set.set(norm(r), r));
  spaceItems().forEach((m) => { if (m.room) set.set(norm(m.room), m.room); });
  return [...set.values()].sort();
}
function renderRooms() {
  const rf = $('roomFilter'), cur = rf.value;
  rf.innerHTML = '';
  const o0 = document.createElement('option'); o0.value = ''; o0.textContent = t('allRooms'); rf.appendChild(o0);
  roomOptions().forEach((r) => { const o = document.createElement('option'); o.value = r; o.textContent = r; rf.appendChild(o); });
  rf.value = cur || '';
  const pf = $('personFilter'), pc = pf.value;
  pf.innerHTML = '';
  const p0 = document.createElement('option'); p0.value = ''; p0.textContent = t('everyone'); pf.appendChild(p0);
  [...new Set(spaceItems().map((m) => m.person).filter(Boolean))].sort().forEach((p) => {
    const o = document.createElement('option'); o.value = p; o.textContent = p; pf.appendChild(o);
  });
  pf.value = pc || '';
  const chips = $('roomChips'); chips.innerHTML = '';
  t('rooms').forEach((r) => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'chip'; b.textContent = r;
    b.onclick = () => { $('f_room').value = r; };
    chips.appendChild(b);
  });
}
function filtered() {
  const q = $('searchInput').value.trim();
  let hits = q ? smartSearch(q) : [...spaceItems()].sort((a, b) => b.updatedAt - a.updatedAt);
  const rf = $('roomFilter').value, pf = $('personFilter').value;
  if (rf) hits = hits.filter((m) => norm(m.room) === norm(rf));
  if (pf) hits = hits.filter((m) => (m.person || '') === pf);
  if (favOnly) hits = hits.filter((m) => m.fav);
  const s = $('sortSel').value;
  if (s === 'az') hits.sort((a, b) => norm(a.item).localeCompare(norm(b.item)));
  else if (s === 'used') hits.sort((a, b) => (b.usages || 0) - (a.usages || 0));
  else if (!q) hits.sort((a, b) => b.updatedAt - a.updatedAt);
  /* while searching with default sort, relevance order from smartSearch wins */
  return hits;
}
/* safe match highlighting for result cards */
function esc(s) {
  return (s || '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function hiMark(text, q) {
  const canonToks = [...new Set(tokens(q))].filter((w) => w.length > 1);
  const rawToks = norm(q).split(' ').filter((w) => w.length > 1 && !STOP.has(w));
  const all = [...new Set([...canonToks, ...rawToks])].sort((a, b) => b.length - a.length).slice(0, 6);
  let out = esc(text);
  for (const w of all) {
    try {
      out = out.replace(new RegExp('(' + w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'ig'), '<mark>$1</mark>');
    } catch (e) {}
  }
  return out;
}
function renderList() {
  const list = $('list'); list.innerHTML = '';
  const query = $('searchInput').value.trim();
  const hits = filtered();
  updateUndoBtn();
  $('emptyState').classList.toggle('hidden', hits.length > 0);
  for (const m of hits.slice(0, 300)) {
    const d = document.createElement('div'); d.className = 'mem';
    const top = document.createElement('div'); top.className = 'mem-top';
    const left = document.createElement('div');
    const h = document.createElement('p'); h.className = 'mem-item';
    h.innerHTML = `${m.fav ? '⭐ ' : ''}${hiMark(cap(m.item), query)}`;
    const p = document.createElement('p'); p.className = 'mem-loc';
    p.innerHTML = `📍 <b>${hiMark(m.location, query)}</b>`;
    left.append(h, p);
    const tags = document.createElement('div'); tags.className = 'mem-tags';
    if (m.room) { const s = document.createElement('span'); s.className = 'tag'; s.textContent = '🏠 ' + m.room; tags.appendChild(s); }
    if (m.person) { const s = document.createElement('span'); s.className = 'tag'; s.textContent = '👤 ' + m.person; tags.appendChild(s); }
    const s2 = document.createElement('span'); s2.className = 'tag'; s2.textContent = '🗓 ' + whenText(m.updatedAt); tags.appendChild(s2);
    if (m.usages > 0) { const s = document.createElement('span'); s.className = 'tag'; s.textContent = `🔁 ${m.usages}`; tags.appendChild(s); }
    if (m.notes) { const s = document.createElement('span'); s.className = 'tag'; s.textContent = '📝 ' + m.notes; tags.appendChild(s); }
    left.appendChild(tags);
    const acts = document.createElement('div'); acts.className = 'mem-actions';
    const mk = (txt, title, fn, on) => {
      const btn = document.createElement('button');
      btn.type = 'button'; btn.className = 'iconbtn' + (on ? ' on' : ''); btn.textContent = txt; btn.title = title; btn.setAttribute('aria-label', title);
      btn.onclick = fn; return btn;
    };
    acts.append(
      mk('🔊', 'Speak', () => speak(answerText(m))),
      mk('⭐', 'Favorite', () => { m.fav = !m.fav; save(); renderList(); }, m.fav),
      mk('✏️', 'Edit', () => startEdit(m.id)),
      mk('🗑', 'Delete', () => {
        lastDeleted = { items: [m] };
        items = items.filter((x) => x.id !== m.id);
        save(); renderRooms(); renderList(); toast(t('deleted'));
      })
    );
    top.append(left, acts); d.appendChild(top); list.appendChild(d);
  }
}
/* top-3 latest on the Ask screen — tap to hear */
function renderRecent() {
  const box = $('recentList');
  if (!box) return;
  box.innerHTML = '';
  const top = [...spaceItems()].sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 3);
  if (!top.length) {
    const p = document.createElement('p');
    p.className = 'hint'; p.textContent = t('emptyMsg'); box.appendChild(p); return;
  }
  for (const m of top) {
    const d = document.createElement('div');
    d.className = 'rec'; d.tabIndex = 0; d.setAttribute('role', 'button');
    const say = () => speak(answerText(m));
    d.onclick = say;
    d.onkeydown = (e) => { if (e.key === 'Enter') say(); };
    const b = document.createElement('b'); b.textContent = cap(m.item);
    const s = document.createElement('span'); s.textContent = ' → ' + m.location;
    d.append(b, s); box.appendChild(d);
  }
}
function updateUndoBtn() {
  const b = $('undoBtn');
  if (b) b.classList.toggle('hidden', !lastDeleted);
}
function undoDelete() {
  if (!lastDeleted) return;
  items.push(...lastDeleted.items);
  lastDeleted = null;
  save(); renderRooms(); renderList();
}
function renderStats() {
  renderRecent();
  $('statTotal').textContent = spaceItems().length;
  const start = new Date(); start.setHours(0, 0, 0, 0);
  $('statToday').textContent = spaceItems().filter((m) => m.createdAt >= start.getTime()).length;
  $('statFav').textContent = spaceItems().filter((m) => m.fav).length;
  const el = $('favFilter'); if (el) el.setAttribute('aria-pressed', String(favOnly));
}
async function renderMeter() {
  let txt = `${items.length} memories · ${(JSON.stringify(items).length / 1024).toFixed(1)} KB`;
  try {
    if (navigator.storage && navigator.storage.estimate) {
      const { usage = 0, quota = 0 } = await navigator.storage.estimate();
      if (quota) {
        $('storageMeter').style.width = Math.min(100, (usage / quota) * 100).toFixed(1) + '%';
        txt += ` · ${(usage / 1048576).toFixed(1)} MB / ${(quota / 1048576).toFixed(0)} MB`;
      }
    }
  } catch (e) {}
  $('storageText').textContent = txt;
}

/* ---------- CRUD ---------- */
function readForm() {
  return {
    item: $('f_item').value.trim(), location: $('f_loc').value.trim(),
    room: $('f_room').value.trim(), person: $('f_person').value.trim(), notes: $('f_notes').value.trim()
  };
}
function fillForm(m) {
  $('f_item').value = m.item || ''; $('f_loc').value = m.location || '';
  $('f_room').value = m.room || ''; $('f_person').value = m.person || ''; $('f_notes').value = m.notes || '';
}
function startEdit(id) {
  const m = items.find((x) => x.id === id);
  if (!m) return;
  editingId = id; fillForm(m);
  showTab('add');
  $('saveBtn').querySelector('span').textContent = lang === 'hi' ? 'बदलाव सहेजो' : 'Save changes';
  $('addForm').scrollIntoView({ behavior: 'smooth' }); $('f_item').focus();
}
function saveForm(e) {
  if (e) e.preventDefault();
  const f = readForm();
  if (!f.item || !f.location) { toast(t('needBoth')); return; }
  if (editingId) {
    const m = items.find((x) => x.id === editingId);
    if (m) Object.assign(m, f, { updatedAt: Date.now() });
    editingId = null;
    $('saveBtn').querySelector('span').textContent = t('remember');
    toast(t('updated'));
  } else {
    /* duplicate guard: same thing already saved → offer to update, not clutter */
    const dup = spaceItems().find((x) => canon(norm(x.item)) === canon(norm(f.item)) && canon(norm(x.item)).length > 0);
    if (dup && confirm(t('dupMsg')(cap(f.item), dup.location))) {
      Object.assign(dup, f, { updatedAt: Date.now() });
      $('addForm').reset(); save(); renderRooms(); renderList();
      toast(t('updated')); showTab('mem'); return;
    }
    items.unshift({ id: uid(), owner: me().id, scope: activeSpace, ...f, fav: false, usages: 0, createdAt: Date.now(), updatedAt: Date.now() });
    toast(t('saved'));
    speak(lang === 'hi' ? `${cap(f.item)} याद कर लिया।` : `${cap(f.item)} remembered.`);
  }
  $('addForm').reset(); save(); renderRooms(); renderList();
  showTab('mem');
}
function quickSave() {
  const v = $('quickInput').value.trim();
  if (!v) { toast(t('needBoth')); return; }
  const p = parseSentence(v);
  if (p) {
    items.unshift({ id: uid(), owner: me().id, scope: activeSpace, item: p.item, location: p.location, room: '', person: '', notes: v, fav: false, usages: 0, createdAt: Date.now(), updatedAt: Date.now() });
    $('quickInput').value = '';
    toast(t('saved')); speak(lang === 'hi' ? `${cap(p.item)} याद कर लिया।` : `${cap(p.item)} remembered.`);
  } else {
    /* can't split confidently → put whole sentence in the form for one-tap fix */
    fillForm({ item: v, location: '', room: '', person: '', notes: '' });
    toast(t('needBoth'));
    $('addForm').scrollIntoView({ behavior: 'smooth' }); $('f_loc').focus();
    return;
  }
  save(); renderRooms(); renderList();
}

/* ---------- share + csv (built-in Web Share / Blob — still zero-network) ---------- */
function listText() {
  return [...spaceItems()].sort((a, b) => norm(a.item).localeCompare(norm(b.item)))
    .map((m) => `${cap(m.item)} → ${m.location}${m.room ? ` (${m.room})` : ''}${m.person ? ` — ${m.person}` : ''}`)
    .join('\n') || '—';
}
async function shareList() {
  const text = (lang === 'hi' ? 'GharYaad सूची:\n' : 'GharYaad list:\n') + listText();
  try {
    if (navigator.share) { await navigator.share({ title: 'GharYaad', text }); return; }
    throw new Error('no-share');
  } catch (e) {
    try {
      if (e && e.name === 'AbortError') return;
      await navigator.clipboard.writeText(text);
      toast(t('copied'));
    } catch (_) { toast(t('copied') + ': ' + text.slice(0, 60) + '…'); }
  }
}
function exportCSV() {
  const q = (v) => `"${String(v == null ? '' : v).replace(/"/g, '""')}"`;
  const rows = [['item', 'location', 'room', 'person', 'notes', 'favorite', 'asked', 'updated'],
    ...items.map((m) => [m.item, m.location, m.room || '', m.person || '', m.notes || '', m.fav ? 'yes' : 'no', m.usages || 0, new Date(m.updatedAt).toISOString()])];
  const blob = new Blob(['\uFEFF' + rows.map((r) => r.map(q).join(',')).join('\n')], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `gharyaad-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);
  toast(t('csvDone'));
}

/* ---------- backup ---------- */
function exportBackup() {
  const blob = new Blob([JSON.stringify({ v: 2, app: 'GharYaad', items, profiles, activeProfileId, activeSpace, savedAt: Date.now() }, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  const d = new Date().toISOString().slice(0, 10);
  a.href = URL.createObjectURL(blob); a.download = `gharyaad-backup-${d}.json`;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);
  toast(t('exported'));
}
function importBackup(file) {
  const r = new FileReader();
  r.onload = () => {
    try {
      const data = JSON.parse(r.result);
      const arr = Array.isArray(data) ? data : data.items;
      if (!Array.isArray(arr) || !arr.every((x) => x && typeof x.item === 'string' && typeof x.location === 'string')) throw new Error('bad');
      /* family backup carries members — merge unknown profiles so owners resolve */
      if (Array.isArray(data.profiles)) {
        for (const p of data.profiles) {
          if (p && p.id && p.name && !profiles.find((x) => x.id === p.id)) {
            profiles.push({ id: String(p.id), name: String(p.name).slice(0, 30), pinHash: '' });
          }
        }
      }
      const known = new Set(profiles.map((p) => p.id));
      const fallbackOwner = me().id;
      const seen = new Set(items.map((m) => norm(m.item) + '|' + norm(m.location) + '|' + m.scope + '|' + m.owner));
      let added = 0;
      for (const x of arr) {
        const scope = x.scope === 'private' ? 'private' : 'family';
        const owner = known.has(x.owner) ? x.owner : fallbackOwner;
        const k = norm(x.item) + '|' + norm(x.location) + '|' + scope + '|' + owner;
        if (seen.has(k)) continue;
        seen.add(k);
        items.push({ id: x.id || uid(), owner, scope, item: String(x.item).slice(0, 80), location: String(x.location).slice(0, 140), room: String(x.room || '').slice(0, 60), person: String(x.person || '').slice(0, 60), notes: String(x.notes || '').slice(0, 200), fav: !!x.fav, usages: +x.usages || 0, createdAt: +x.createdAt || Date.now(), updatedAt: +x.updatedAt || Date.now() });
        added++;
      }
      save(); renderAll();
      toast(`${t('imported')} (+${added})`);
    } catch (e) { toast(t('badFile')); }
  };
  r.readAsText(file);
}

/* ---------- wiring ---------- */
function setLang(l) {
  lang = l;
  try { localStorage.setItem(LANG_KEY, l); } catch (e) {}
  applyLang();
}
/* one screen at a time — bottom-tab navigation */
function showTab(name) {
  document.querySelectorAll('.screen').forEach((s) => s.classList.toggle('active', s.id === 'screen-' + name));
  document.querySelectorAll('.tab').forEach((b) => b.classList.toggle('active', b.dataset.tab === name));
  try { window.scrollTo(0, 0); } catch (e) {}
  if (name === 'mem') renderList();
}
function wire() {
  $('langEn').onclick = () => setLang('en');
  $('langHi').onclick = () => setLang('hi');
  $('profileBtn').onclick = () => { showTab('more'); setTimeout(() => $('memberList').scrollIntoView({ behavior: 'smooth', block: 'center' }), 100); };

  document.querySelectorAll('.space-btn').forEach((b) => {
    b.onclick = () => { stopAll(); setSpace(b.dataset.space); };
  });

  $('addMemberBtn').onclick = () => {
    const v = $('newMember').value.trim().slice(0, 30);
    if (!v) return;
    profiles.push({ id: uid(), name: v, pinHash: '' });
    $('newMember').value = '';
    save(); renderMembers(); renderSpaceToggles();
    toast(`${t('memberAdded')} ${v}`);
  };
  $('newMember').addEventListener('keydown', (e) => { if (e.key === 'Enter') $('addMemberBtn').click(); });
  $('pinOk').onclick = () => { pinVerify($('pinInput').value.trim()); $('pinDialog').close(); };
  $('pinCancel').onclick = () => { pinPending = null; $('pinDialog').close(); };
  $('pinInput').addEventListener('keydown', (e) => { if (e.key === 'Enter') $('pinOk').click(); });

  document.querySelectorAll('.tab').forEach((b) => {
    b.onclick = () => { stopAll(); showTab(b.dataset.tab); };
  });
  $('browseBtn').onclick = () => showTab('mem');

  $('micBtn').onclick = () => {
    if (listening) { stopAll(); return; }
    $('answerCard').classList.add('hidden'); lastAnswer = '';
    listenOnce({ onFinal: (txt) => { if (txt) askSpoken(txt); else { toast(t('noSpeech')); setMicUI(false, t('tapAsk')); } } });
  };
  $('speakAgainBtn').onclick = () => lastAnswer && speak(lastAnswer);
  $('stopSpeakBtn').onclick = stopAll;

  $('quickAddBtn').onclick = quickSave;
  $('quickInput').addEventListener('keydown', (e) => { if (e.key === 'Enter') quickSave(); });
  $('quickMicBtn').onclick = () => listenOnce({ targetInput: $('quickInput'), onFinal: () => {} });
  $('searchMicBtn').onclick = () => listenOnce({
    targetInput: $('searchInput'),
    onFinal: (txt) => { renderList(); if (txt) { const h = smartSearch(extractQuery(txt)); if (h.length) askSpoken(txt); } }
  });

  document.querySelectorAll('[data-target]').forEach((b) => {
    b.onclick = () => {
      const inp = $(b.dataset.target);
      listenOnce({ targetInput: inp, onFinal: () => inp.focus() });
      inp.focus();
    };
  });

  let deb = null;
  $('searchInput').addEventListener('input', () => { clearTimeout(deb); deb = setTimeout(renderList, 120); });
  $('roomFilter').onchange = renderList; $('personFilter').onchange = renderList; $('sortSel').onchange = renderList;
  $('favFilter').onclick = () => { favOnly = !favOnly; $('favFilter').classList.toggle('primary', favOnly); renderList(); renderStats(); };
  $('clearFilters').onclick = () => { $('searchInput').value = ''; $('roomFilter').value = ''; $('personFilter').value = ''; favOnly = false; renderList(); renderStats(); };

  $('addForm').addEventListener('submit', saveForm);
  $('addForm').addEventListener('reset', () => {
    editingId = null;
    setTimeout(() => { $('saveBtn').querySelector('span').textContent = t('remember'); }, 0);
  });
  $('clearAllBtn').onclick = () => {
    if (!items.length) return;
    if (confirm(t('confirmClear'))) {
      const gone = spaceItems();
      lastDeleted = { items: [...gone] };
      const ids = new Set(gone.map((m) => m.id));
      items = items.filter((m) => !ids.has(m.id));
      save(); renderRooms(); renderList(); toast(t('cleared'));
    }
  };

  $('exportBtn').onclick = exportBackup;
  $('shareBtn').onclick = shareList;
  $('csvBtn').onclick = exportCSV;
  $('undoBtn').onclick = undoDelete;
  $('importFile').addEventListener('change', (e) => { if (e.target.files[0]) importBackup(e.target.files[0]); e.target.value = ''; });

  $('helpBtn').onclick = () => { $('helpDialog').showModal(); };
  $('closeHelp').onclick = () => $('helpDialog').close();

  document.addEventListener('keydown', (e) => {
    if (e.key === '/' && document.activeElement.tagName !== 'INPUT') { e.preventDefault(); showTab('mem'); $('searchInput').focus(); }
    else if ((e.key === 'm' || e.key === 'M') && document.activeElement.tagName !== 'INPUT') { e.preventDefault(); showTab('ask'); $('micBtn').click(); }
    else if (e.key === 'Escape') stopAll();
  });

  /* PWA install */
  let deferred = null;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault(); deferred = e; $('installBtn').classList.remove('hidden');
  });
  $('installBtn').onclick = async () => {
    if (!deferred) return;
    deferred.prompt(); await deferred.userChoice; deferred = null;
    $('installBtn').classList.add('hidden');
  };
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
    try { if (navigator.voices === undefined) {} } catch (e) {}
  }
  if (window.speechSynthesis) {
    window.speechSynthesis.getVoices();
    window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
  }
  if (!SR) {
    ['micBtn', 'quickMicBtn', 'searchMicBtn'].forEach((id) => {
      const b = $(id); if (b && id !== 'micBtn') b.style.display = 'none';
    });
    setMicUI(false, t('noMic'));
  }
}

/* ---------- boot ---------- */
load();
wire();
applyLang();
