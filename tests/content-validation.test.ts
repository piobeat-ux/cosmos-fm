import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseFaq, safeHttpsUrl, navigationTarget } from '../src/lib/content-validation.ts';
import { expandSchedule, stationInput, stationIso, type BroadcastSchedule } from '../src/lib/schedule.ts';

test('malformed FAQ never crashes rendering', () => {
  for (const value of ['null','{}','[null]','[1]','not-json','[{"question":4,"answer":null}]',null]) assert.deepEqual(parseFaq(value), []);
  assert.deepEqual(parseFaq('[{"question":"Q","answer":"A"},null]'), [{ question: 'Q', answer: 'A' }]);
});
test('navigation rejects executable URLs and unknown routes', () => {
  assert.equal(safeHttpsUrl('javascript:alert(1)'), undefined);
  assert.equal(safeHttpsUrl('https://user:secret@example.com'), undefined);
  assert.equal(navigationTarget('#/unknown'), null);
  assert.deepEqual(navigationTarget('#/faq'), { tab: 'faq' });
  assert.deepEqual(navigationTarget('https://example.com'), { href: 'https://example.com/' });
});
test('calendar converts Moscow wall time regardless of browser timezone', () => {
  assert.equal(stationIso('2026-09-14T12:30'), '2026-09-14T09:30:00.000Z');
  assert.equal(stationInput('2026-09-14T09:30:00.000Z'), '2026-09-14T12:30');
});
test('calendar expands weekly entries and respects end and window boundaries', () => {
  const entry: BroadcastSchedule = { id: 'a', show_id: 's', podcast_id: null, starts_at: '2026-09-14T09:00:00Z', duration_seconds: 600, weekly: true, repeat_until: '2026-09-21T09:00:00Z', published: true };
  const events = expandSchedule(entry, new Date('2026-09-14T09:05:00Z'), new Date('2026-10-10T00:00:00Z'));
  assert.equal(events.length, 2);
  assert.equal(events[1].start.toISOString(), '2026-09-21T09:00:00.000Z');
  assert.equal(expandSchedule({ ...entry, weekly: false }, new Date('2026-09-14T09:10:00Z'), new Date('2026-09-15T00:00:00Z')).length, 0);
});
