import { describe, expect, it } from 'vitest';
process.env.JWT_SECRET ||= 'test';
const { suggestPriority } = await import('../src/services/priority.js');

describe('priority engine', () => {
  it('rates severe illegal dumping near a school as High', () => expect(suggestPriority({ categorySlug: 'illegal-dumping', severity: 'high', text: 'dumped behind the school' })).toBe('High'));
  it('rates a delayed collection with moderate severity as Medium', () => expect(suggestPriority({ categorySlug: 'delayed-collection', severity: 'medium', text: 'missed twice' })).toBe('Medium'));
  it('rates a minor isolated issue as Low', () => expect(suggestPriority({ categorySlug: 'other', severity: 'low', text: 'small litter' })).toBe('Low'));
});
