// Resource identifiers are full https:// URLs, which contain characters
// (`/`, `:`) that CloudFront/API Gateway do not reliably preserve as
// percent-encoded when forwarding a request through to the Lambda - by the
// time Express sees the path, prior percent-encoding may already have been
// fully decoded, breaking route matching for a single `:id` param.
//
// Base64url has none of those characters, so it survives the CloudFront ->
// API Gateway -> Lambda round trip completely unmodified. Pairs with
// `encodePathParam` on the frontend.
const decodePathParam = (value: string): string =>
  Buffer.from(value, 'base64url').toString('utf8');

export default decodePathParam;
