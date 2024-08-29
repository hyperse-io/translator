# @hyperse/translator

<p align="left">
  <a aria-label="Build" href="https://github.com/hyperse-io/translator/actions?query=workflow%3ACI">
    <img alt="build" src="https://img.shields.io/github/actions/workflow/status/hyperse-io/translator/ci-integrity.yml?branch=main&label=ci&logo=github&style=flat-quare&labelColor=000000" />
  </a>
  <a aria-label="stable version" href="https://www.npmjs.com/package/@hyperse/translator">
    <img alt="stable version" src="https://img.shields.io/npm/v/%40hyperse%2Ftranslator?branch=main&label=version&logo=npm&style=flat-quare&labelColor=000000" />
  </a>
  <a aria-label="Top language" href="https://github.com/hyperse-io/translator/search?l=typescript">
    <img alt="GitHub top language" src="https://img.shields.io/github/languages/top/hyperse-io/translator?style=flat-square&labelColor=000&color=blue">
  </a>
  <a aria-label="Licence" href="https://github.com/hyperse-io/translator/blob/main/LICENSE">
    <img alt="Licence" src="https://img.shields.io/github/license/hyperse-io/translator?style=flat-quare&labelColor=000000" />
  </a>
</p>

Translates messages from the given namespace by using the ICU syntax.

## Usage

### Case 1

```ts
const messages = {
  Home: {
    title: 'Hello world!',
    rich: '<b>Hello <i>{name}</i>!</b>',
    nest: {
      span: 'Hello nest',
    },
  },
};

const t = createTranslator({
  locale: 'en',
  namespace: 'Home',
  messages,
});

expect(t('title')).toBe('Hello world!');
```

### case 2

```ts
it('Translate a message', () => {
  const t = createTranslator({
    locale: 'en',
    namespace: 'Home',
    messages,
  });

  expect(
    t('rich', {
      name: 'world',
      b: (chunks) => `<strong>${chunks}</strong>`,
      i: (chunks) => `<i>${chunks}</i>`,
    })
    // rich: '<b>Hello <i>{name}</i>!</b>',
  ).toBe('<strong>Hello <i>world</i>!</strong>');
});
```
