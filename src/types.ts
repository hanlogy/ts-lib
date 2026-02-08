export type DateInput = Date | string | number;

export type PrimitiveValue = string | number | boolean | null;

export type PrimitiveRecord<T extends PrimitiveValue = PrimitiveValue> =
  Readonly<Record<string, T>>;

/**
 * All possible values that can be parsed from a JSON string.
 * https://www.ietf.org/archive/id/draft-bhutton-json-schema-01.html#name-instance-data-model
 */
export type JsonValue =
  | PrimitiveValue
  | readonly JsonValue[]
  | { readonly [key: string]: JsonValue };

/**
 * A JSON object parsed from a string (key-value structure).
 */
export type JsonRecord = Readonly<Record<string, JsonValue>>;
