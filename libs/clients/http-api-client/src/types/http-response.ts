import { BooleanParser, NumberParser, ObjectParser, StringParser } from 'type-safe-validator'

/// Response object for HTTP calls
export interface HttpResponse {
  /// The value returned in the body
  value: Value

  /// HTTP status code
  status: number | null

  /// The status text returned by http request
  statusText: string | null

  /// Has the response got a value in the body
  hasValue: boolean

  /// The error text if an error is returned within data of http response
  errorText: string | null

  /// Has the response returned an error
  hasError: boolean
}

export type Value =
  | string
  | undefined
  | null
  | number
  | Value[]
  | {
    // eslint-disable-next-line no-unused-vars
    [key in string | number]: string | number | object | boolean | null | undefined | Value[]
  }

export const httpResponseSchema = ObjectParser({
  status: NumberParser({ nullable: true }),
  statusText: StringParser({ nullable: true }),
  hasValue: BooleanParser(),
  errorText: StringParser({ nullable: true }),
  hasError: BooleanParser(),
})