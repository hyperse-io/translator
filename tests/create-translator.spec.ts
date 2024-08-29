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
    },
  };

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

  it('can translate a message', () => {
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
});
