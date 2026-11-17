// Transparent rule-based priority engine (no AI claimed).
// score = category weight + reported severity + urgency keywords in the text.
// Admins can always override the suggested priority.
export const CATEGORY_WEIGHT = {
  'illegal-dumping': 2, 'overflowing-bin': 2, 'construction-waste': 2,
  'delayed-collection': 1, 'household-waste': 1, 'commercial-waste': 1, 'plastic-waste': 1, other: 0,
};
export const SEVERITY_WEIGHT = { low: 0, medium: 1, high: 2 };
const URGENT = ['road', 'blocking', 'blocked', 'hospital', 'school', 'market', 'smell', 'disease', 'health', 'children', 'drain', 'flood', 'toxic'];

export function suggestPriority({ categorySlug, severity = 'low', text = '' }) {
  const reasons = [];
  let score = CATEGORY_WEIGHT[categorySlug] ?? 0;
  if (score >= 2) reasons.push('Category has high public impact');
  const sev = SEVERITY_WEIGHT[severity] ?? 0;
  score += sev * 1.5;
  if (sev) reasons.push(`Reported severity: ${severity}`);
  const hits = URGENT.filter((k) => text.toLowerCase().includes(k)).slice(0, 2);
  if (hits.length) { score += hits.length; reasons.push(`Urgency keywords: ${hits.join(', ')}`); }
  const priority = score >= 4 ? 'High' : score >= 2 ? 'Medium' : 'Low';
  return { priority, score, reasons };
}
