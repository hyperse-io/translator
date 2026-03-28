import type { ReactElement, ReactNode } from 'react';
import type { Formats } from 'intl-messageformat';
import { createTranslatorImpl } from './createTranslatorImpl.js';
import {
  defaultGetMessageFallback,
  defaultOnError,
  defaultPlainMessageCheck,
} from './defaults.js';
import type { Formatters, IntlCache } from './formatter/formatters.js';
import { createCache, createIntlFormatters } from './formatter/formatters.js';
import type { AbstractIntlMessages } from './types/AbstractIntlMessages.js';
import type { IntlConfig } from './types/IntlConfig.js';
import type { MessageKeys } from './types/MessageKeys.js';
import type { NamespaceKeys } from './types/NamespaceKeys.js';
import type { NestedKeyOf } from './types/NestedKeyOf.js';
import type { NestedValueOf } from './types/NestedValueOf.js';
import type { RichTranslationValues } from './types/TranslationValues.js';

/**
 * Translates messages from the given namespace by using the ICU syntax.
 * See https://formatjs.io/docs/core-concepts/icu-syntax.
 *
 * If no namespace is provided, all available messages are returned.
 * The namespace can also indicate nesting by using a dot
 * (e.g. `namespace.Component`).
 */
export function createTranslator<
  IntlMessages extends AbstractIntlMessages,
  NestedKey extends NamespaceKeys<IntlMessages, NestedKeyOf<IntlMessages>> =
    never,
>({
  _cache = createCache(),
  _formatters = createIntlFormatters(_cache),
  messages,
  namespace,
  onError = defaultOnError,
  getMessageFallback = defaultGetMessageFallback,
  plainMessageCheck = defaultPlainMessageCheck,
  ...rest
}: Omit<IntlConfig<IntlMessages>, 'defaultTranslationValues' | 'messages'> & {
  messages: IntlMessages;
  namespace?: NestedKey;
  /** @private */
  _formatters?: Formatters;
  /** @private */
  _cache?: IntlCache;
}): // Explicitly defining the return type is necessary as TypeScript would get it wrong
{
  // Default invocation
  <
    TargetKey extends MessageKeys<
      NestedValueOf<
        { '!': IntlMessages },
        [NestedKey] extends [never] ? '!' : `!.${NestedKey}`
      >,
      NestedKeyOf<
        NestedValueOf<
          { '!': IntlMessages },
          [NestedKey] extends [never] ? '!' : `!.${NestedKey}`
        >
      >
    >,
  >(
    key: TargetKey,
    values?: RichTranslationValues,
    formats?: Partial<Formats>
  ): string;
  // `rich`
  rich<
    TargetKey extends MessageKeys<
      NestedValueOf<
        { '!': IntlMessages },
        [NestedKey] extends [never] ? '!' : `!.${NestedKey}`
      >,
      NestedKeyOf<
        NestedValueOf<
          { '!': IntlMessages },
          [NestedKey] extends [never] ? '!' : `!.${NestedKey}`
        >
      >
    >,
  >(
    key: TargetKey,
    values?: RichTranslationValues,
    formats?: Partial<Formats>
  ): string | ReactElement | ReactNode[];
} {
  // We have to wrap the actual function so the type inference for the optional
  // namespace works correctly. See https://stackoverflow.com/a/71529575/343045
  // The prefix ("!") is arbitrary.
  return createTranslatorImpl<
    { '!': IntlMessages },
    [NestedKey] extends [never] ? '!' : `!.${NestedKey}`
  >(
    {
      ...rest,
      cache: _cache,
      formatters: _formatters,
      onError,
      getMessageFallback,
      plainMessageCheck,
      messages: { '!': messages },
      namespace: namespace ? `!.${namespace}` : '!',
    },
    '!'
  );
}
