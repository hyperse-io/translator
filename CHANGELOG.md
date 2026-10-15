# @hyperse/translator

## 1.4.0

### Minor Changes

- [`9c430d5`](https://github.com/hyperse-io/translator/commit/9c430d5e54a84665c6f62758bf0b426b8a2c2a9d) Thanks [@tianyingchun](https://github.com/tianyingchun)! - Upgrade `intl-messageformat` from v11 to v12.

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

## 1.3.3

### Patch Changes

- [`41c2813`](https://github.com/hyperse-io/translator/commit/41c2813dde8e5b339150f7b467732f5266f65038) Thanks [@tianyingchun](https://github.com/tianyingchun)! - bump version

## 1.3.2

### Patch Changes

- [`1a15238`](https://github.com/hyperse-io/translator/commit/1a152381ed29251a0f56831bf4bc4b4a469cec96) Thanks [@tyc15129](https://github.com/tyc15129)! - add missed exports `createFormatter`

## 1.3.1

### Patch Changes

- [`0ef331f`](https://github.com/hyperse-io/translator/commit/0ef331fcc499576b1746e5a378ea2a935c6a98d8) Thanks [@tyc15129](https://github.com/tyc15129)! - Add `react` as depenency

## 1.3.0

### Minor Changes

- [`c020f1a`](https://github.com/hyperse-io/translator/commit/c020f1a6281b410c6d87183dec229fbfc77bdfbc) Thanks [@tyc15129](https://github.com/tyc15129)! - Enhanced the plain message check functionality in the translation system

## 1.2.4

### Patch Changes

- [#6](https://github.com/hyperse-io/translator/pull/6) [`5b5b7ab`](https://github.com/hyperse-io/translator/commit/5b5b7ab79a6ed862beac1d2eff443195273181ec) Thanks [@tclxshunquan-wang](https://github.com/tclxshunquan-wang)! - fix: update AbstractIntlMessages type to use object instead of recursive type

## 1.2.3

### Patch Changes

- [`c384a10`](https://github.com/hyperse-io/translator/commit/c384a1056af181eaef685633fe48630b04ecf63e) Thanks [@tianyingchun](https://github.com/tianyingchun)! - bump version

- [`c384a10`](https://github.com/hyperse-io/translator/commit/c384a1056af181eaef685633fe48630b04ecf63e) Thanks [@tianyingchun](https://github.com/tianyingchun)! - bump version

## 1.2.2

### Patch Changes

- [`0cdd3a6`](https://github.com/hyperse-io/translator/commit/0cdd3a693c00fe9f17b303c65928c333726ae434) Thanks [@tianyingchun](https://github.com/tianyingchun)! - bump react to 19.0.0

## 1.2.1

### Patch Changes

- [`b6c6b85`](https://github.com/hyperse-io/translator/commit/b6c6b8540d2f8f8b8535361b677045c036ef62e4) Thanks [@tianyingchun](https://github.com/tianyingchun)! - update `docs`, fix `timezone` typings issue

## 1.2.0

### Minor Changes

- [`5d21216`](https://github.com/hyperse-io/translator/commit/5d21216082192a8827fd3d8378c7f0d3b0095cce) Thanks [@tianyingchun](https://github.com/tianyingchun)! - reactor, merge latest core from `next-intl`

## 1.1.0

### Minor Changes

- [`098edb6`](https://github.com/hyperse-io/translator/commit/098edb6c3edc12d02f5606a3d7e5902d7769395c) Thanks [@tianyingchun](https://github.com/tianyingchun)! - add `t.rich` support for react component
