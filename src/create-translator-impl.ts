import { createBaseTranslator } from './create-base-translator.js';
import type {
  AbstractIntlMessages,
  InitializedIntlConfiguration,
  NestedKeyOf,
} from './translator.type.js';
import { getMessagesOrError, resolveNamespace } from './utils.js';

export type CreateTranslatorImplProps<Messages> =
  InitializedIntlConfiguration & {
    namespace: string;
    messages: Messages;
  };

export function createTranslatorImpl<
  Messages extends AbstractIntlMessages,
  NestedKey extends NestedKeyOf<Messages>,
>(
  {
    messages,
    namespace,
    getMessageFallback,
    onError,
    ...rest
  }: CreateTranslatorImplProps<Messages>,
  namespacePrefix: string
) {
  // The `namespacePrefix` is part of the type system.
  // See the comment in the function invocation.
  messages = messages[namespacePrefix] as Messages;
  namespace = resolveNamespace(namespace, namespacePrefix) as NestedKey;
  const translator = createBaseTranslator<Messages, NestedKey>({
    ...rest,
    onError,
    getMessageFallback,
    namespace: undefined,
    messagesOrError: getMessagesOrError({
      messages,
      namespace,
    }) as Messages,
  });

  function base(...args: Parameters<typeof translator>) {
    return translator(...args);
  }

  return base;
}
