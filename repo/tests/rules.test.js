// Exhaustive test of the rules engine across every answer combination (single-choice × common multi-choice combos)
global.window = global; global.document = { readyState: 'complete', getElementById: () => null, addEventListener(){} };
require('../assets/ubb.js');
const { recommend, fallbackSummary, isSafeSummary, STEPS } = window.UBB;
const opt = id => STEPS.find(s => s.id === id).options;
const subsets = (arr, max) => { const out = []; const rec = (i, cur) => { if (cur.length) out.push(cur); if (cur.length === max) return; for (let j = i; j < arr.length; j++) rec(j + 1, cur.concat(arr[j])); }; rec(0, []); return out; };
let n = 0, fails = [], dist = {};
const goals = subsets(opt('goals'), 2);
const current = [['none'], ['meal'], ['meal', 'gift'], ['wellness'], ['expense_cards'], ['health_insurance']];
const spend = [['no'], ['fuel'], ['travel'], ['purchases'], ['fuel', 'travel', 'purchases']];
for (const size of opt('size')) for (const industry of opt('industry')) for (const work_model of opt('work_model'))
for (const g of goals) for (const c of current) for (const sp of spend) for (const budget of opt('budget')) {
  const a = { size, industry, work_model, goals: g, current: c, spend: sp, budget }; n++;
  const r = recommend(a);
  const ids = r.items.map(i => i.id);
  if (!ids.length) fails.push(['empty', a]);
  if (new Set(ids).size !== ids.length) fails.push(['dup', a]);
  if (r.items[0].role !== 'core') fails.push(['nocore', a]);
  if (r.items.some(i => !i.reasons.length)) fails.push(['noreason', a]);
  if (g.includes('expenses') && !ids.includes('expense')) fails.push(['expense-goal-missed', a]);
  if (g.includes('wellbeing') && !ids.includes('fitpass') && budget !== 'lt50') fails.push(['wellbeing-missed', a]);
  for (const lang of ['el', 'en']) { const s = fallbackSummary(a, r, lang); if (!isSafeSummary(s, r, lang)) fails.push(['fallback-unsafe', lang, s]); }
  const key = ids.join('+'); dist[key] = (dist[key] || 0) + 1;
}
console.log('combinations tested:', n, '| failures:', fails.length);
fails.slice(0, 5).forEach(f => console.log(JSON.stringify(f)));
console.log('top packages:', Object.entries(dist).sort((a, b) => b[1] - a[1]).slice(0, 12));
// Guardrail checks on hand-written bad AI outputs
const a = { size: '50-249', industry: 'tech', work_model: 'hybrid', goals: ['wellbeing'], current: ['none'], spend: ['no'], budget: 'unsure' };
const r = recommend(a);
const bad = {
  price: 'Με το FlexOne και το Fitpass η ομάδα σου κερδίζει έως 1.452€ τον χρόνο αφορολόγητα, ενώ το Fitpass δίνει πρόσβαση σε γυμναστήρια σε όλη την Ελλάδα και βοηθά στη μείωση του στρες και του burnout των εργαζομένων σου κάθε μέρα.',
  otherProduct: 'Με το FlexOne και το Fitpass η ομάδα σου απολαμβάνει ευεξία, ενώ η Up Expense σε βοηθά να ελέγχεις τα εταιρικά έξοδα σε πραγματικό χρόνο, με reports που μιλάνε μόνα τους και λιγότερη γραφειοκρατία για όλους στην εταιρεία.',
  wrongLang: 'With FlexOne and Fitpass your hybrid team gets one card for everyday benefits plus a wellness pass for gyms and studios across Greece, which helps reduce stress and keeps people engaged wherever they work from each day of the week.',
};
for (const [k, v] of Object.entries(bad)) console.log('guardrail blocks', k + ':', !isSafeSummary(v, r, 'el'));
