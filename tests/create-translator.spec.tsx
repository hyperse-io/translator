import { isValidElement } from 'react';
import { renderToString } from 'react-dom/server';
import { createTranslator } from '../src/create-translator.js';
import type { IntlError } from '../src/intl-error.js';
import { IntlErrorCode } from '../src/intl-error.js';

describe('Translator Service', () => {
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
  it('can correct a message within a time formats locale(en)', () => {
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
  });

  it('can correct a message within a time formats locale(zh)', () => {
    const t = createTranslator({
      locale: 'zh',
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

    expect(result1).toBe('Ordered on 2020年11月20日');
    expect(result2).toBe('Ordered on 20/11/20');
    expect(result3).toBe('Ordered on 2020/11/20');
  });

  it('can translate a message within a namespace', () => {
    const t = createTranslator({
      locale: 'en',
      namespace: 'Home',
      messages,
    });

    expect(t('title')).toBe('Hello world!');
  });

  it('can translate a message without a namespace', () => {
    const t = createTranslator({
      locale: 'en',
      messages,
    });
    expect(t('Home.title')).toBe('Hello world!');
  });

  it('translate a message with fallback', () => {
    const t = createTranslator({
      locale: 'en',
      messages: messages as any,
    });
    expect(t('Home.title1')).toBe('Home.title1');
  });

  it('handle the plural argument can be used', () => {
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
  });

  it('handles formatting errors', () => {
    const onError = vitest.fn();

    const t = createTranslator({
      locale: 'en',
      messages: { price: '{value}' },
      onError,
    });

    const result = t('price');

    const error: IntlError = onError.mock.calls[0][0];
    expect(error.message).toBe(
      'FORMATTING_ERROR: The intl string context variable "value" was not provided to the string "{value}"'
    );
    expect(error.code).toBe(IntlErrorCode.FORMATTING_ERROR);

    expect(result).toBe('price');
  });

  describe('t.rich', () => {
    it('can translate a message to a ReactNode', () => {
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
    });
  });
});
