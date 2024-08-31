import { DateTimeFormatOptions } from './DateTimeFormatOptions.js';
import { NumberFormatOptions } from './NumberFormatOptions.js';

export type Formats = {
  number: Record<string, NumberFormatOptions>;
  dateTime: Record<string, DateTimeFormatOptions>;
  list: Record<string, Intl.ListFormatOptions>;
};
