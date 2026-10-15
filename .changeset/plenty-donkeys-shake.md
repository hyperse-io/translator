---
"@hyperse/translator": minor
---

Upgrade `intl-messageformat` from v11 to v12.

This is a major bump of an internal dependency. The public API of this package is unchanged and no source changes were required, but note the following if you supply your own `formatters` or custom `Formats`:

- `IntlMessageFormat`'s constructor signature, its static `formats` registry and the `opts.formatters` contract are unchanged, so existing `Formats` objects keep working.
- `intl-messageformat` v12 introduces a `FormattedText` branded string type for formatter output. This package's return types are unaffected (`string | T | (string | T)[]`), so no consumer changes are needed.
- v12 drops the `@formatjs/ecma402-abstract` transitive dependency, which reduces install size.

Also refreshed in the same release:

- `@formatjs/fast-memoize` 3.1.1 -> 3.1.7 (patch)
- `react` 19.2.4 -> 19.3.1 (minor, peer/type surface only)

Tooling, not published to consumers:

- yarn 4.10.2 -> 4.18.1.
- TypeScript is now pinned to `^6.x`. `tsconfig.json` required no change for TS 6, though `moduleResolution: "Node"` now emits TS5107 and will need attention before TS 7.
