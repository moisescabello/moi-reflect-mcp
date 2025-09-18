import { test } from 'node:test';
import assert from 'node:assert/strict';

import { resolveTimeZone, createDailyNoteFormatter } from '../date-utils.js';

test('resolveTimeZone falls back to system when requested is invalid', () => {
  const result = resolveTimeZone('Invalid/Zone');

  assert.equal(result.isFallback, true);
  assert.ok(result.effectiveTimeZone, 'should expose effective time zone');
});

test('createDailyNoteFormatter generates today and tomorrow correctly', () => {
  const formatter = createDailyNoteFormatter('UTC');
  const base = new Date('2024-01-01T12:00:00Z');

  const today = formatter(base, 0);
  const tomorrow = formatter(base, 1);

  assert.equal(today, '2024-01-01');
  assert.equal(tomorrow, '2024-01-02');
});
