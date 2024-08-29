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

export function resolvePath(
  messages: AbstractIntlMessages | undefined,
  key: string,
  namespace?: string
): AbstractIntlMessages {
  if (!messages) {
    throw new Error(`No messages available at \`${namespace}\`.`);
  }

  let message: AbstractIntlMessages | string = messages;

  key.split('.').forEach((part) => {
    const next = (message as any)[part];

    if (part == null || next == null) {
      throw new Error(
        `Could not resolve \`${key}\` in ${
          namespace ? `\`${namespace}\`` : 'messages'
        }.`
      );
    }

    message = next;
  });

  return message;
}

export function getMessagesOrError<Messages extends AbstractIntlMessages>({
  messages,
  namespace,
}: {
  messages: Messages;
  namespace?: string;
}) {
  try {
    if (!messages) {
      throw new Error(`No messages were configured on the provider.`);
    }

    const retrievedMessages = namespace
      ? resolvePath(messages, namespace)
      : messages;

    if (!retrievedMessages) {
      throw new Error(`No messages for namespace \`${namespace}\` found.`);
    }

    return retrievedMessages;
  } catch (error) {
    return new IntlError(
      IntlErrorCode.MISSING_MESSAGE,
      (error as Error).message
    );
  }
}

export function prepareTranslationValues(values: RichTranslationValues) {
  if (Object.keys(values).length === 0) return undefined;

  // Workaround for https://github.com/formatjs/formatjs/issues/1467
  const transformedValues: RichTranslationValues = {};
  Object.keys(values).forEach((key) => {
    const value = values[key];
    let transformed;
    if (typeof value === 'function') {
      transformed = (chunks: any) => {
        return value(chunks);
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

export function defaultOnError(error: IntlError) {
  console.error(error);
}
