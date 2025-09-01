import type { PlainMessageCheck } from '../types/IntlConfig.js';

export function getPlainMessage(
  candidate: string,
  values?: unknown,
  plainMessageCheck?: PlainMessageCheck
) {
  if (values) return undefined;

  const unescapedMessage = candidate.replace(/'([{}])/gi, '$1');

  // Use the provided check function or fall back to the default logic
  const checkFunction =
    plainMessageCheck || ((message: string) => !/<|{/.test(message));
  const isPlain = checkFunction(unescapedMessage);

  if (isPlain) {
    return unescapedMessage;
  }

  return undefined;
}
