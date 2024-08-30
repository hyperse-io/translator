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

```ts
const messages = {
  Home: {
    title: 'Hello world!',
    rich: '<b>Hello <i>{name}</i>!</b>',
    nest: {
      span: 'Hello nest',
    },
    localeStr: '{locale, select, zh {简体中文} en {English} other {Unknown}}',
    pluralization:
      'You have {count, plural, =0 {no followers yet} =1 {one follower} other {# followers}}.',
    ordered: 'Ordered on {orderDate, date, long}',
    orderedShort: 'Ordered on {orderDate, date, short}',
    orderedCustom: 'Ordered on {orderDate, date, ::yyyyMMdd}',
  },
};
```

### Normal translation

Static messages will be used as-is

```ts
const t = createTranslator({
  locale: 'en',
  namespace: 'Home',
  messages,
});

expect(t('title')).toBe('Hello world!');
```

### Rich text

format rich text with custom tags and map them to React components

```ts
const t = createTranslator({
  locale: 'en',
  namespace: 'Home',
  messages,
});

const result = t.rich('rich', {
  name: 'world',
  b: (chunks) => <b>{chunks}</b>,
  i: (chunks) => <i>{chunks}</i>,
});

expect(isValidElement(result)).toBe(true);
expect(renderToString(result as any)).toBe('<b>Hello <i>world</i>!</b>');
```

### Time formats

```ts
const t = createTranslator({
  locale: 'en',
  namespace: 'Home',
  messages,
});
const result1 = t('ordered', {
  orderDate: new Date('2020-11-20T10:36:01.516Z'),
});

const result2 = t('orderedShort', {
  orderDate: new Date('2020-11-20T10:36:01.516Z'),
});

const result3 = t('orderedCustom', {
  orderDate: new Date('2020-11-20T10:36:01.516Z'),
});

expect(result1).toBe('Ordered on November 20, 2020');
expect(result2).toBe('Ordered on 11/20/20');
expect(result3).toBe('Ordered on 11/20/2020');
```

### Cardinal pluralization

```ts
const t = createTranslator({
  locale: 'en',
  messages: messages,
});
expect(t('Home.pluralization', { count: 3580 })).toBe(
  'You have 3,580 followers.'
);
expect(
  t('Home.localeStr', {
    locale: 'zh',
  })
).toBe('简体中文');
```
