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

> This library leverages the ICU message format (supported by intl-messageformat) to translate strings from a specified namespace. It enables highly customizable localization, including support for number formatting, date formatting, pluralization, and selective message variations.

> This library is a translation solution designed specifically for Node.js-based business applications, with a particular focus on enhancing the translation of EDM (Email Delivery Management) messages. It provides a unified approach to handling translations, ensuring consistency across both React and Node.js environments.

## Key Features:

- Node.js-centric: Built specifically for Node.js applications, catering to the needs of server-side translation.
- EDM Focus: Offers robust support for translating EDM messages, ensuring emails are localized effectively.
- Multi-Platform Support: Works seamlessly in both React and Node.js environments, enabling consistent translation across frontend and backend.
- Potential for Improved User Experience: By providing a centralized solution for translations, it simplifies localization efforts and ensures consistent language across various touchpoints, enhancing user experience.
- [React.Email](https://react.email/docs/introduction) international support
- Perfect type typings for a smooth development experience

## Benefits:

- Simplified Localization: Offers a unified approach to translation, streamlining the process for developers.
- Enhanced Consistency: Ensures consistent translations across platforms, providing a cohesive user experience.
- Increased Efficiency: By centralizing translation management, it potentially reduces the effort required for localizing applications.
- Improved Internationalization: Supports the globalization of applications, making them accessible to a wider audience.

## Usage:

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

### Currency format

```ts
const order = {
  total: 123456 / 100,
  currencyCode: 'USD',
};

const languageCode = 'en';

const formatter = createFormatter({
  locale: languageCode,
});

expect(
  formatter.number(order.total, {
    style: 'currency',
    currency: order.currencyCode,
  })
).toBe('$1,234.56');

expect(
  formatter.number(order.total, {
    style: 'currency',
    currency: 'GBP',
  })
).toBe('£1,234.56');
```

### Date and time formatting

```ts
const languageCode = 'en';

const formatter = createFormatter({
  locale: languageCode,
});

it('should correct render numeric datetime', () => {
  const dateTime = new Date('2020-11-20T10:36:01.516Z');
  expect(
    formatter.dateTime(dateTime, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  ).toBe('Nov 20, 2020');

  expect(
    formatter.dateTime(dateTime, {
      hour: 'numeric',
      minute: 'numeric',
      timeZone: 'UTC',
    })
  ).toBe('10:36 AM');
});

it('should correct format relative times', () => {
  let dateTime = new Date('2020-11-20T08:30:00.000Z');

  // At 2020-11-20T10:36:00.000Z, this will render "2 hours ago"
  expect(
    formatter.relativeTime(dateTime, new Date('2020-11-20T10:36:00.000Z'))
  ).toBe('2 hours ago');

  dateTime = new Date('2020-03-20T08:30:00.000Z');
  const now = new Date('2020-11-22T10:36:00.000Z');

  // Renders "247 days ago"
  expect(formatter.relativeTime(dateTime, { now, unit: 'day' })).toBe(
    '247 days ago'
  );
});
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
