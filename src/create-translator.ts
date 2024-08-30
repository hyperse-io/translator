import { ReactElement, ReactNode } from 'react';
import type { Formats } from 'intl-messageformat';
import { createTranslatorImpl } from './create-translator-impl.js';
import { defaultOnError } from './defaults.js';
import type {
  AbstractIntlMessages,
  IntlConfiguration,
  MessageKeys,
  NamespaceKeys,
  NestedKeyOf,
  NestedValueOf,
  RichTranslationValues,
} from './translator.type.js';
import { defaultGetMessageFallback } from './utils.js';

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
  NestedKey extends NamespaceKeys<
    IntlMessages,
    NestedKeyOf<IntlMessages>
  > = never,
>({
  onError = defaultOnError,
  getMessageFallback = defaultGetMessageFallback,
  messages,
  namespace,
  ...rest
}: IntlConfiguration & {
  messages: IntlMessages;
  namespace?: NestedKey;
}): {
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
      onError,
      getMessageFallback,
      messages: { '!': messages },
      namespace: namespace ? `!.${namespace}` : '!',
    },
    '!'
  );
}
