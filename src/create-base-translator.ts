import { isValidElement, ReactElement, ReactNode } from 'react';
import type { Formats } from 'intl-messageformat';
import { IntlMessageFormat } from 'intl-messageformat';
import { IntlError, IntlErrorCode } from './intl-error.js';
import type {
  AbstractIntlMessages,
  InitializedIntlConfiguration,
  MessageKeys,
  NestedKeyOf,
  NestedValueOf,
  RichTranslationValues,
} from './translator.type.js';
import {
  defaultGetMessageFallback,
  getMessagesOrError,
  prepareTranslationValues,
  resolvePath,
} from './utils.js';

export type CreateBaseTranslatorProps<Messages> =
  InitializedIntlConfiguration & {
    cachedFormatsByLocale?: Record<string, Record<string, IntlMessageFormat>>;
    defaultTranslationValues?: RichTranslationValues;
    namespace?: string;
    messages: Messages;
    messagesOrError: Messages;
  };

function getPlainMessage(candidate: string, values?: unknown) {
  if (values) return undefined;

  const unescapedMessage = candidate.replace(/'([{}])/gi, '$1');

  // Placeholders can be in the message if there are default values,
  // or if the user has forgotten to provide values. In the latter
  // case we need to compile the message to receive an error.
  const hasPlaceholders = /<|{/.test(unescapedMessage);

  if (!hasPlaceholders) {
    return unescapedMessage;
  }

  return undefined;
}

export function createBaseTranslator<
  Messages extends AbstractIntlMessages,
  NestedKey extends NestedKeyOf<Messages>,
>({
  locale,
  namespace,
  messages,
  cachedFormatsByLocale = {},
  defaultTranslationValues,
  onError,
  getMessageFallback = defaultGetMessageFallback,
}: Omit<CreateBaseTranslatorProps<Messages>, 'messagesOrError'>) {
  const messagesOrError = getMessagesOrError<Messages>({
    locale,
    messages,
    namespace,
    onError,
  }) as Messages | IntlError;

  function getFallbackFromErrorAndNotify(
    key: string,
    code: IntlErrorCode,
    message?: string
  ) {
    const error = new IntlError(code, message);
    onError(error);
    return getMessageFallback({ error, key, namespace });
  }

  function translateBaseFn(
    /** Use a dot to indicate a level of nesting (e.g. `namespace.nestedLabel`). */
    key: string,
    /** Key value pairs for values to interpolate into the message. */
    values?: RichTranslationValues,
    /** Provide custom formats for numbers, dates and times. */
    formats?: Partial<Formats>
  ): string | ReactElement | ReactNode[] {
    if (messagesOrError instanceof IntlError) {
      // We have already warned about this during render
      return getMessageFallback({
        error: messagesOrError,
        key,
        namespace,
      });
    }

    const messages = messagesOrError;

    let message;
    try {
      message = resolvePath(locale, messages, key, namespace);
    } catch (error) {
      return getFallbackFromErrorAndNotify(
        key,
        IntlErrorCode.MISSING_MESSAGE,
        (error as Error).message
      );
    }
    // Hot path that avoids creating an `IntlMessageFormat` instance
    const plainMessage = getPlainMessage(message as unknown as string, values);
    if (plainMessage) return plainMessage;

    const cacheKey = [namespace, key, message]
      .filter((part) => part != null)
      .join('.');

    let messageFormat: IntlMessageFormat;
    if (cachedFormatsByLocale?.[locale]?.[cacheKey]) {
      messageFormat = cachedFormatsByLocale?.[locale][cacheKey];
    } else {
      if (typeof message === 'object') {
        return getFallbackFromErrorAndNotify(
          key,
          IntlErrorCode.INSUFFICIENT_PATH,
          `Insufficient path specified for \`${key}\` in \`${
            namespace ? `\`${namespace}\`` : 'messages'
          }\`.`
        );
      }
      try {
        messageFormat = new IntlMessageFormat(message, locale, formats, {});
      } catch (error) {
        return getFallbackFromErrorAndNotify(
          key,
          IntlErrorCode.INVALID_MESSAGE,
          (error as Error).message
        );
      }

      if (cachedFormatsByLocale) {
        if (!cachedFormatsByLocale[locale]) {
          cachedFormatsByLocale[locale] = {};
        }
        cachedFormatsByLocale[locale][cacheKey] = messageFormat;
      }
    }

    try {
      const toTranslateValues: RichTranslationValues = {
        ...defaultTranslationValues,
        ...values,
      };
      const toFormatValues = prepareTranslationValues(toTranslateValues);

      const formattedMessage = (messageFormat as IntlMessageFormat).format(
        // for rich text elements since a recent minor update. This
        // needs to be evaluated in detail, possibly also in regards
        // to be able to format to parts.
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        toFormatValues
      );
      if (formattedMessage == null) {
        throw new Error(
          `Unable to format \`${key}\` in ${
            namespace ? `namespace \`${namespace}\`` : 'messages'
          }`
        );
      }

      // Limit the function signature to return strings or React elements
      return isValidElement(formattedMessage) ||
        // Arrays of React elements
        Array.isArray(formattedMessage) ||
        typeof formattedMessage === 'string'
        ? formattedMessage
        : String(formattedMessage);
    } catch (error) {
      return getFallbackFromErrorAndNotify(
        key,
        IntlErrorCode.FORMATTING_ERROR,
        (error as Error).message
      );
    }
  }

  function translateFn<
    TargetKey extends MessageKeys<
      NestedValueOf<Messages, NestedKey>,
      NestedKeyOf<NestedValueOf<Messages, NestedKey>>
    >,
  >(
    /** Use a dot to indicate a level of nesting (e.g. `namespace.nestedLabel`). */
    key: TargetKey,
    /** Key value pairs for values to interpolate into the message. */
    values?: RichTranslationValues,
    /** Provide custom formats for numbers, dates and times. */
    formats?: Partial<Formats>
  ): string {
    const result = translateBaseFn(key, values, formats);

    if (typeof result !== 'string') {
      return getFallbackFromErrorAndNotify(
        key,
        IntlErrorCode.INVALID_MESSAGE,
        `The message \`${key}\` in ${
          namespace ? `namespace \`${namespace}\`` : 'messages'
        } didn't resolve to a string.`
      );
    }

    return result;
  }
  translateFn.rich = translateBaseFn;

  return translateFn;
}
