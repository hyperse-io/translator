import { isValidElement, ReactElement, ReactNode } from 'react';
import type { Formats } from 'intl-messageformat';
import { IntlMessageFormat } from 'intl-messageformat';
import { defaultGetMessageFallback } from './defaults.js';
import { Formatters, IntlCache } from './formatter/formatters.js';
import { IntlError, IntlErrorCode } from './IntlError.js';
import { AbstractIntlMessages } from './types/AbstractIntlMessages.js';
import { InitializedIntlConfig } from './types/IntlConfig.js';
import { MessageKeys } from './types/MessageKeys.js';
import { NestedKeyOf } from './types/NestedKeyOf.js';
import { NestedValueOf } from './types/NestedValueOf.js';
import { RichTranslationValues } from './types/TranslationValues.js';
import { convertFormatsToIntlMessageFormat } from './utils/convertFormatsToIntlMessageFormat.js';
import { createMessageFormatter } from './utils/createMessageFormatter.js';
import { getMessagesOrError } from './utils/getMessagesOrError.js';
import { getPlainMessage } from './utils/getPlainMessage.js';
import { joinPath } from './utils/joinPath.js';
import { prepareTranslationValues } from './utils/prepareTranslationValues.js';
import { resolvePath } from './utils/resolvePath.js';

export type CreateBaseTranslatorProps<Messages> = InitializedIntlConfig & {
  cache: IntlCache;
  formatters: Formatters;
  defaultTranslationValues?: RichTranslationValues;
  namespace?: string;
  messagesOrError: Messages | IntlError;
};

export function createBaseTranslator<
  Messages extends AbstractIntlMessages,
  NestedKey extends NestedKeyOf<Messages>,
>(config: Omit<CreateBaseTranslatorProps<Messages>, 'messagesOrError'>) {
  const messagesOrError = getMessagesOrError(
    config.locale,
    config.messages,
    config.namespace,
    config.onError
  ) as Messages | IntlError;
  return createBaseTranslatorImpl<Messages, NestedKey>({
    ...config,
    messagesOrError,
  });
}

export function createBaseTranslatorImpl<
  Messages extends AbstractIntlMessages,
  NestedKey extends NestedKeyOf<Messages>,
>({
  cache,
  defaultTranslationValues,
  formats: globalFormats,
  formatters,
  getMessageFallback = defaultGetMessageFallback,
  locale,
  messagesOrError,
  namespace,
  onError,
  timeZone,
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

    if (typeof message === 'object') {
      let code, errorMessage;
      if (Array.isArray(message)) {
        code = IntlErrorCode.INVALID_MESSAGE;
        if (process.env.NODE_ENV !== 'production') {
          errorMessage = `Message at \`${joinPath(
            namespace,
            key
          )}\` resolved to an array, but only strings are supported. See https://next-intl-docs.vercel.app/docs/usage/messages#arrays-of-messages`;
        }
      } else {
        code = IntlErrorCode.INSUFFICIENT_PATH;
        if (process.env.NODE_ENV !== 'production') {
          errorMessage = `Message at \`${joinPath(
            namespace,
            key
          )}\` resolved to an object, but only strings are supported. Use a \`.\` to retrieve nested messages. See https://next-intl-docs.vercel.app/docs/usage/messages#structuring-messages`;
        }
      }

      return getFallbackFromErrorAndNotify(key, code, errorMessage);
    }

    let messageFormat: IntlMessageFormat;

    // Hot path that avoids creating an `IntlMessageFormat` instance
    const plainMessage = getPlainMessage(message as string, values);
    if (plainMessage) return plainMessage;

    // Lazy init the message formatter for better tree
    // shaking in case message formatting is not used.
    if (!formatters.getMessageFormat) {
      formatters.getMessageFormat = createMessageFormatter(cache, formatters);
    }

    try {
      messageFormat = formatters.getMessageFormat(
        message,
        locale,
        convertFormatsToIntlMessageFormat(
          { ...globalFormats, ...formats },
          timeZone
        ),
        {
          formatters: {
            ...formatters,
            getDateTimeFormat(locales, options) {
              // Workaround for https://github.com/formatjs/formatjs/issues/4279
              return formatters.getDateTimeFormat(locales, {
                timeZone,
                ...options,
              });
            },
          },
        }
      );
    } catch (error) {
      const thrownError = error as Error;
      return getFallbackFromErrorAndNotify(
        key,
        IntlErrorCode.INVALID_MESSAGE,
        process.env.NODE_ENV !== 'production'
          ? thrownError.message +
              ('originalMessage' in thrownError
                ? ` (${thrownError.originalMessage})`
                : '')
          : thrownError.message
      );
    }

    try {
      const formattedMessage = messageFormat.format(
        // @ts-expect-error `intl-messageformat` expects a different format
        // for rich text elements since a recent minor update. This
        // needs to be evaluated in detail, possibly also in regards
        // to be able to format to parts.
        prepareTranslationValues({ ...defaultTranslationValues, ...values })
      );

      if (formattedMessage == null) {
        throw new Error(
          process.env.NODE_ENV !== 'production'
            ? `Unable to format \`${key}\` in ${
                namespace ? `namespace \`${namespace}\`` : 'messages'
              }`
            : undefined
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
