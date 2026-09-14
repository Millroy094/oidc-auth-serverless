function handler(event) {
  var request = event.request;
  var uri = request.uri;

  // Client-side routes (e.g. /account, /login) don't correspond to real
  // objects in the S3 bucket. Rewrite any request that isn't for a real
  // file (no extension in the last path segment) to /index.html so the
  // React app can handle routing. This only runs on the default (S3)
  // cache behavior, so API Gateway responses are never touched/masked.
  var lastSegment = uri.split('/').pop();
  if (lastSegment.indexOf('.') === -1) {
    request.uri = '/index.html';
  }

  return request;
}
