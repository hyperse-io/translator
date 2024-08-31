// Placed here for improved tree shaking. Somehow when this is placed in
import { IntlMessageFormat } from 'intl-messageformat';
import {
  IntlCache,
  IntlFormatters,
  memoFn,
  MessageFormatter,
} from '../formatter/formatters.js';

// `formatters.tsx`, then it can't be shaken off from `next-intl`.
export function createMessageFormatter(
  cache: IntlCache,
  intlFormatters: IntlFormatters
): MessageFormatter {
  const getMessageFormat = memoFn(
    (...args: ConstructorParameters<typeof IntlMessageFormat>) =>
      new IntlMessageFormat(args[0], args[1], args[2], {
        formatters: intlFormatters,
        ...args[3],
      }),
    cache.message
  );

  return getMessageFormat;
}
