// API Gateway decodes `%2F` back into `/` before the Lambda sees it, breaking
// route matching for path params containing slashes (e.g. resource URLs).
// Double-encoding survives that extra decoding step.
const encodePathParam = (value: string): string =>
  encodeURIComponent(encodeURIComponent(value));

export default encodePathParam;
