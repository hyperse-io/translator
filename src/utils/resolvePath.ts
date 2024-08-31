import { AbstractIntlMessages } from '../types/AbstractIntlMessages.js';
import { joinPath } from './joinPath.js';

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
