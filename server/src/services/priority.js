// Transparent rule-based priority engine (no AI). Same rules as the client preview.
// score = category weight + reported severity (x1.5) + urgency keywords (max 2). Admins may override.
const CATEGORY_WEIGHT = { 'illegal-dumping': 2, 'overflowing-bin': 2, 'construction-waste': 2, 'delayed-collection': 1, 'household-waste': 1, 'commercial-waste': 1, 'plastic-waste': 1, other: 0 };
const SEVERITY_WEIGHT = { low: 0, medium: 1, high: 2 };
const URGENT = ['road', 'blocking', 'blocked', 'hospital', 'school', 'market', 'smell', 'disease', 'health', 'children', 'drain', 'flood', 'toxic'];

export function suggestPriority({ categorySlug, severity = 'low', text = '' }) {
  let score = (CATEGORY_WEIGHT[categorySlug] ?? 0) + (SEVERITY_WEIGHT[severity] ?? 0) * 1.5;
  score += URGENT.filter((k) => text.toLowerCase().includes(k)).slice(0, 2).length;
  return score >= 4 ? 'High' : score >= 2 ? 'Medium' : 'Low';
}
