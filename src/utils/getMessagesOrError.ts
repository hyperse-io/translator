import { defaultOnError } from '../defaults.js';
import { IntlError, IntlErrorCode } from '../IntlError.js';
import { AbstractIntlMessages } from '../types/AbstractIntlMessages.js';
import { resolvePath } from './resolvePath.js';

export function getMessagesOrError<Messages extends AbstractIntlMessages>(
  locale: string,
  messages?: Messages,
  namespace?: string,
  onError: (error: IntlError) => void = defaultOnError
) {
  try {
    if (!messages) {
      throw new Error(
        process.env.NODE_ENV !== 'production'
          ? `No messages were configured on the provider.`
          : undefined
      );
    }

    const retrievedMessages = namespace
      ? resolvePath(locale, messages, namespace)
      : messages;

    if (!retrievedMessages) {
      throw new Error(
        process.env.NODE_ENV !== 'production'
          ? `No messages for namespace \`${namespace}\` found.`
          : namespace
      );
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
