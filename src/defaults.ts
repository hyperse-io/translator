import { IntlError } from './intl-error';

export function defaultOnError(error: IntlError) {
  console.error(error);
}
