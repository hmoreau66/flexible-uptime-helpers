import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatUptime, defaultUnitThresholds } from '../src/core.js';

test('formats days and hours', () => {
  // 3 days + 4 hours
  const ms = 3 * defaultUnitThresholds.day + 4 * defaultUnitThresholds.hour;
  assert.equal(formatUptime(ms), '3d 4h');
});

test('formats hours and minutes', () => {
  const ms = 2 * defaultUnitThresholds.hour + 5 * defaultUnitThresholds.minute;
  assert.equal(formatUptime(ms), '2h 5m');
});

test('formats minutes and seconds', () => {
  const ms = 12 * defaultUnitThresholds.minute + 5 * defaultUnitThresholds.second;
  assert.equal(formatUptime(ms), '12m 5s');
});

test('single second renders alone', () => {
  assert.equal(formatUptime(1000), '1s');
});

test('zero duration returns empty string', () => {
  assert.equal(formatUptime(0), '');
});

test('negative duration is treated as zero', () => {
  assert.equal(formatUptime(-5000), '');
});

test('non-finite duration is treated as zero', () => {
  assert.equal(formatUptime(Infinity), '');
  assert.equal(formatUptime(NaN), '');
});

test('sub-millisecond remainder is floored away', () => {
  // 999ms is below one second and not enough to render a unit.
  assert.equal(formatUptime(999), '');
});

test('fractional milliseconds are floored', () => {
  // Exactly one second plus a sub-millisecond fraction.
  assert.equal(formatUptime(1000.9), '1s');
});

test('only two largest units are shown, no rounding', () => {
  // 1 day, 23h, 59m, 59s, 999ms — must become '1d 23h', not '2d'.
  const ms =
    1 * defaultUnitThresholds.day +
    23 * defaultUnitThresholds.hour +
    59 * defaultUnitThresholds.minute +
    59 * defaultUnitThresholds.second +
    999;
  assert.equal(formatUptime(ms), '1d 23h');
});

test('custom thresholds override a single unit', () => {
  // Define a "day" as exactly 8 hours for compactness in dashboards.
  const result = formatUptime(8 * 60 * 60 * 1000, { day: 8 * 60 * 60 * 1000 });
  assert.equal(result, '1d 0h');
});

test('custom thresholds with non-finite values fall back to defaults', () => {
  // NaN day should be ignored; 25h should render as '1d 1h' with default day.
  const ms = 25 * defaultUnitThresholds.hour;
  assert.equal(formatUptime(ms, { day: NaN }), '1d 1h');
});

test('defaultUnitThresholds is frozen', () => {
  assert.ok(Object.isFrozen(defaultUnitThresholds));
});
