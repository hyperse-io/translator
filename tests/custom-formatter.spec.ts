import { createTranslator } from '../src/createTranslator';

describe('custom formatter', () => {
  it('should format the message', () => {
    const t = createTranslator({
      locale: 'en',
      namespace: 'en',
      messages: {
        en: {
          hello: 'Hello {name}',
          token: 'hps deploy -t <target> -f [filter]',
        },
        zh: {
          hello: '你好 {name}',
          token: 'hps deploy -t <target> -f [filter]',
        },
      },
    });

    // expect(t('hello', { name: 'John' })).toBe('Hello John');
    expect(t('token')).toBe('en.token'); // This now returns the fallback because < is detected as a placeholder
  });

  it('should use custom plain message check', () => {
    const t = createTranslator({
      locale: 'en',
      namespace: 'en',
      messages: {
        en: {
          hello: 'Hello {name}',
          token: 'hps deploy -t <target> -f [filter]',
        },
        zh: {
          hello: '你好 {name}',
          token: 'hps deploy -t <target> -f [filter]',
        },
      },
      // Custom plain message check that treats the token message as plain
      plainMessageCheck: (message: string) => {
        // Treat messages containing 'hps deploy' as plain, regardless of < or { characters
        if (message.includes('hps deploy')) {
          return true;
        }
        // Default behavior for other messages
        return !/<|{/.test(message);
      },
    });

    expect(t('token')).toBe('hps deploy -t <target> -f [filter]');
    expect(t('hello', { name: 'John' })).toBe('Hello John');
  });
});
