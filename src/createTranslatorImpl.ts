import { createBaseTranslator } from './createBaseTranslator.js';
import { Formatters, IntlCache } from './formatter/formatters.js';
import { AbstractIntlMessages } from './types/AbstractIntlMessages.js';
import { InitializedIntlConfig } from './types/IntlConfig.js';
import { NestedKeyOf } from './types/NestedKeyOf.js';
import { resolveNamespace } from './utils/resolveNamespace.js';

export type CreateTranslatorImplProps<Messages> = Omit<
  InitializedIntlConfig,
  'messages'
> & {
  namespace: string;
  messages: Messages;
  formatters: Formatters;
  cache: IntlCache;
};

export function createTranslatorImpl<
  Messages extends AbstractIntlMessages,
  NestedKey extends NestedKeyOf<Messages>,
>(
  { messages, namespace, ...rest }: CreateTranslatorImplProps<Messages>,
  namespacePrefix: string
) {
  // The `namespacePrefix` is part of the type system.
  // See the comment in the function invocation.
  messages = messages[namespacePrefix] as Messages;
  namespace = resolveNamespace(namespace, namespacePrefix) as NestedKey;
  const translator = createBaseTranslator<Messages, NestedKey>({
    ...rest,
    namespace,
    messages,
  });

  function base(...args: Parameters<typeof translator>) {
    return translator(...args);
  }
  base.rich = function (...args: Parameters<typeof translator>) {
    return translator.rich(...args);
  };
  return base;
}
