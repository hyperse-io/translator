import type { ReactNode } from 'react';
import type { IntlError } from './intl-error.js';

export type AbstractIntlMessages = {
  [id: string]: AbstractIntlMessages | string;
};

export type NestedKeyOf<ObjectType> = ObjectType extends object
  ? {
      [Key in keyof ObjectType]:
        | `${Key & string}`
        | `${Key & string}.${NestedKeyOf<ObjectType[Key]>}`;
    }[keyof ObjectType]
  : never;

export type NestedValueOf<
  ObjectType,
  Property extends string,
> = Property extends `${infer Key}.${infer Rest}`
  ? Key extends keyof ObjectType
    ? NestedValueOf<ObjectType[Key], Rest>
    : never
  : Property extends keyof ObjectType
    ? ObjectType[Property]
    : never;

export type NamespaceKeys<ObjectType, Keys extends string> = {
  [Property in Keys]: NestedValueOf<ObjectType, Property> extends string
    ? never
    : Property;
}[Keys];

export type MessageKeys<ObjectType, Keys extends string> = {
  [Property in Keys]: NestedValueOf<ObjectType, Property> extends string
    ? Property
    : never;
}[Keys];

export type IntlConfiguration = {
  /** A valid Unicode locale tag (e.g. "en" or "en_GB"). */
  locale: string;
  /** Will be called when a message couldn't be resolved or formatting it led to
   * an error. This defaults to `${namespace}.${key}` You can use this to
   * customize what will be rendered in this case. */
  getMessageFallback?(info: {
    error: IntlError;
    key: string;
    namespace?: string;
  }): string;

  /** This callback will be invoked when an error is encountered during
   * resolving a message or formatting it. This defaults to `console.error` to
   * keep your app running. You can customize the handling by taking
   * `error.code` into account. */
  onError?(error: IntlError): void;
};

/**
 * A stricter set of the configuration that should be used internally
 * once defaults are assigned to `IntlConfiguration`.
 */
export type InitializedIntlConfiguration = IntlConfiguration & {
  onError: NonNullable<IntlConfiguration['onError']>;
  getMessageFallback: NonNullable<IntlConfiguration['getMessageFallback']>;
};

// From IntlMessageFormat#format
export type TranslationValue =
  | string
  | number
  | boolean
  | Date
  | null
  | undefined;

// We could consider renaming this to `ReactRichTranslationValues` and defining
// it in the `react` namespace if the core becomes useful to other frameworks.
// It would be a breaking change though, so let's wait for now.
export type RichTranslationValues = Record<
  string,
  TranslationValue | ((chunks: ReactNode) => ReactNode)
>;

export type TranslationValues = Record<string, TranslationValue>;
