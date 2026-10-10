# Uptime Duration Formatter

Formats a millisecond duration into a compact human-readable uptime string such as `3d 4h` or `12m 5s`. By default only the two largest non-zero units are emitted; everything smaller is dropped, not rounded.

## Usage

```js
import { formatUptime, defaultUnitThresholds } from 'uptime-duration-formatter';

formatUptime(3 * defaultUnitThresholds.day + 4 * defaultUnitThresholds.hour);
// => '3d 4h'

formatUptime(65000);
// => '1m 5s'

formatUptime(0);
// => ''

formatUptime(8 * 60 * 60 * 1000, { day: 8 * 60 * 60 * 1000 });
// => '1d 0h'
```

## Why this exists

Uptime displays on dashboards and status pages rarely need to show every unit down to the millisecond — `3d 4h 22m 15s` is visually noisy and the trailing units add no useful information. This library gives you one fixed, predictable shape: the two largest non-zero units, space-separated, using single-letter abbreviations. The trade-off is precision for scanability; if you need exact rendering you already have the raw number of milliseconds.

## Edge cases

- A duration of zero, negative, or non-finite (`NaN`/`Infinity`) milliseconds formats as an empty string, not `0s`. If you need a non-empty representation for zero uptime, handle it in the caller.
- Sub-millisecond remainders are floored away: `999ms` yields `''`.
- Trailing units are dropped, never rounded: `1d 23h 59m 59s 999ms` becomes `1d 23h`, not `2d`.
- Custom threshold values that are non-positive, non-finite, or non-numeric are silently ignored in favour of the default for that unit.
