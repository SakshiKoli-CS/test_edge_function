export default async function handler(request) {
  const modifiedUrl = new URL(request.url);
  modifiedUrl.hostname = "edge-device-adaptation-mobile.contentstackapps.com";
  const newRequest = new Request(modifiedUrl, request);
  return fetch(newRequest);
}
