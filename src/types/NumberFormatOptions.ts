import type { Formats as IntlFormats } from 'intl-messageformat';

// Use the already bundled version of `NumberFormat` from `@formatjs/ecma402-abstract`
// that comes with `intl-messageformat`
export type NumberFormatOptions = IntlFormats['number'][string];
