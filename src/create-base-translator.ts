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
  TranslationValues,
} from './translator.type.js';
import {
  defaultGetMessageFallback,
  prepareTranslationValues,
  resolvePath,
} from './utils.js';

export type CreateBaseTranslatorProps<Messages> =
  InitializedIntlConfiguration & {
    cachedFormatsByLocale?: Record<string, Record<string, unknown>>;
    defaultTranslationValues?: TranslationValues;
    namespace?: string;
    messagesOrError: Messages;
  };

export function createBaseTranslator<
  Messages extends AbstractIntlMessages,
  NestedKey extends NestedKeyOf<Messages>,
>({
  locale,
  messagesOrError,
  namespace,
  cachedFormatsByLocale,
  defaultTranslationValues,
  onError,
  getMessageFallback = defaultGetMessageFallback,
}: CreateBaseTranslatorProps<Messages>) {
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
  ): string {
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
      message = resolvePath(messages, key, namespace);
    } catch (error) {
      return getFallbackFromErrorAndNotify(
        key,
        IntlErrorCode.MISSING_MESSAGE,
        (error as Error).message
      );
    }

    const cacheKey = [namespace, key, message]
      .filter((part) => part != null)
      .join('.');

    let messageFormat;
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
        messageFormat = new IntlMessageFormat(message, locale, formats);
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
      const formattedMessage = (messageFormat as IntlMessageFormat).format(
        // for rich text elements since a recent minor update. This
        // needs to be evaluated in detail, possibly also in regards
        // to be able to format to parts.
        prepareTranslationValues({ ...defaultTranslationValues, ...values })
      );
      if (formattedMessage == null) {
        throw new Error(
          `Unable to format \`${key}\` in ${
            namespace ? `namespace \`${namespace}\`` : 'messages'
          }`
        );
      }

      // Limit the function signature to return strings or React elements
      return typeof formattedMessage === 'string'
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

  return translateFn;
}
