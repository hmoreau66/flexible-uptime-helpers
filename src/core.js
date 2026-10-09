/**
 * Core implementation of the uptime duration formatter.
 */

/**
 * Maximum number of units to render. Keeping this at 2 balances readability
 * against precision: an uptime of `3d 4h 22m 15s` is visually noisy, while
 * `3d 4h` conveys the same gist. Callers needing more detail can read the
 * raw duration themselves.
 *
 * @type {number}
 */
const MAX_UNITS = 2;

/**
 * Default unit thresholds in milliseconds, ordered from largest to smallest.
 *
 * @typedef {Object} UnitThresholds
 * @property {number} day    Milliseconds in one day.
 * @property {number} hour   Milliseconds in one hour.
 * @property {number} minute Milliseconds in one minute.
 * @property {number} second Milliseconds in one second.
 */

/**
 * @type {UnitThresholds}
 */
export const defaultUnitThresholds = Object.freeze({
  day: 24 * 60 * 60 * 1000,
  hour: 60 * 60 * 1000,
  minute: 60 * 1000,
  second: 1000,
});

/**
 * Parse a value into a non-negative finite integer number of milliseconds.
 *
 * Negative durations are treated as zero. Non-integers are floored so that
 * the formatter always works in whole milliseconds, which keeps the output
 * predictable.
 *
 * @param {number} ms  Raw duration in milliseconds.
 * @returns {number}
 */
function normalize(ms) {
  if (typeof ms !== 'number' || !Number.isFinite(ms) || ms <= 0) {
    return 0;
  }
  return Math.floor(ms);
}

/**
 * Format a millisecond duration into a compact human-readable uptime string.
 *
 * Output format: up to two of the largest non-zero units joined by spaces,
 * e.g. `'3d 4h'`, `'12m 5s'`, `'7s'`.
 *
 * Interpretation decisions (stated plainly so callers know what to expect):
 *  - The duration is floored, so any sub-millisecond remainder is discarded.
 *  - Only the two largest non-zero units are emitted. Trailing units are
 *    dropped rather than rounded — `1d 23h 59m 59s 999ms` becomes `1d 23h`,
 *    not `2d`. This avoids implying false precision.
 *  - A duration of zero (or negative, or non-finite) yields an empty
 *    string, not `'0s'`.
 *  - Custom thresholds must cover day/hour/minute/second. Extra keys are
 *    ignored and missing keys fall back to the defaults for that unit only.
 *  - Non-numeric threshold values are ignored in favour of the default.
 *
 * @param {number} ms               Duration in milliseconds.
 * @param {Partial<UnitThresholds>} [thresholds]  Optional overrides for unit sizes.
 * @returns {string}
 */
export function formatUptime(ms, thresholds) {
  const remaining = normalize(ms);
  if (remaining === 0) {
    return '';
  }

  // Merge caller-provided thresholds with defaults, validating each key so a
  // bad override cannot produce nonsensical output.
  const units = { ...defaultUnitThresholds };
  if (thresholds && typeof thresholds === 'object') {
    for (const key of Object.keys(units)) {
      const v = thresholds[key];
      if (typeof v === 'number' && Number.isFinite(v) && v > 0) {
        units[key] = v;
      }
    }
  }

  // Ordered list so the formatter naturally takes the largest units first.
  const ordered = [
    ['day', 'd'],
    ['hour', 'h'],
    ['minute', 'm'],
    ['second', 's'],
  ];

  const parts = [];
  let leftover = remaining;

  for (const [key, symbol] of ordered) {
    if (parts.length >= MAX_UNITS) {
      break;
    }
    const threshold = units[key];
    const value = Math.floor(leftover / threshold);
    if (value > 0 || parts.length > 0) {
      parts.push(`${value}${symbol}`);
      leftover -= value * threshold;
    }
  }

  return parts.join(' ');
}
