/**
 * Uptime Duration Formatter — public entry point.
 *
 * The formatter splits a millisecond duration into the two largest non-zero
 * units and joins them with a single space, e.g. `3d 4h` or `12m 5s`.
 *
 * Units included by default: days, hours, minutes, seconds. Any unit whose
 * value would be zero is dropped entirely, which means a duration of zero
 * milliseconds formats as an empty string — callers that need an explicit
 * representation should handle that case themselves.
 */
export { formatUptime, defaultUnitThresholds } from './core.js';
