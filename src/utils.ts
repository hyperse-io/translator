import { cloneElement, isValidElement, ReactNode } from 'react';
import { defaultOnError } from './defaults.js';
import { IntlError, IntlErrorCode } from './intl-error.js';
import type {
  AbstractIntlMessages,
  RichTranslationValues,
} from './translator.type.js';

export function resolveNamespace(namespace: string, namespacePrefix: string) {
  return namespace === namespacePrefix
    ? undefined
    : namespace.slice((namespacePrefix + '.').length);
}

function joinPath(...parts: Array<string | undefined>) {
  return parts.filter(Boolean).join('.');
}

export function resolvePath(
  locale: string,
  messages: AbstractIntlMessages | undefined,
  key: string,
  namespace?: string
): AbstractIntlMessages {
  const fullKey = joinPath(namespace, key);

  if (!messages) {
    throw new Error(`No messages available at \`${namespace}\`.`);
  }

  let message: AbstractIntlMessages | string = messages;

  key.split('.').forEach((part) => {
    const next = (message as any)[part];

    if (part == null || next == null) {
      throw new Error(
        `Could not resolve \`${fullKey}\` in messages for locale \`${locale}\`.`
      );
    }

    message = next;
  });

  return message;
}

export function getMessagesOrError<Messages extends AbstractIntlMessages>({
  locale,
  messages,
  namespace,
  onError = defaultOnError,
}: {
  locale: string;
  messages: Messages;
  namespace?: string;
  onError?: (error: IntlError) => void;
}) {
  try {
    if (!messages) {
      throw new Error(`No messages were configured on the provider.`);
    }

    const retrievedMessages = namespace
      ? resolvePath(locale, messages, namespace)
      : messages;

    if (!retrievedMessages) {
      throw new Error(`No messages for namespace \`${namespace}\` found.`);
    }

    return retrievedMessages;
  } catch (error) {
    const intlError = new IntlError(
      IntlErrorCode.MISSING_MESSAGE,
      (error as Error).message
    );
    onError(intlError);
    return intlError;
  }
}

export function prepareTranslationValues(values: RichTranslationValues) {
  if (Object.keys(values).length === 0) return undefined;

  // Workaround for https://github.com/formatjs/formatjs/issues/1467
  const transformedValues: RichTranslationValues = {};
  Object.keys(values).forEach((key) => {
    let index = 0;
    const value = values[key];

    let transformed;
    if (typeof value === 'function') {
      transformed = (chunks: ReactNode) => {
        const result = value(chunks);

        return isValidElement(result)
          ? cloneElement(result, { key: key + index++ })
          : result;
      };
    } else {
      transformed = value;
    }

    transformedValues[key] = transformed;
  });

  return transformedValues;
}

/**
 * Contains defaults that are used for all entry points into the core.
 * See also `InitializedIntlConfiguration`.
 */

export function defaultGetMessageFallback(props: {
  error: IntlError;
  key: string;
  namespace?: string;
}) {
  return [props.namespace, props.key].filter((part) => part != null).join('.');
}
