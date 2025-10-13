export default async function handler(request) {
  const url = new URL(request.url);

  if (url.pathname === "/test") {
    url.hostname = "edge-device-adaptation-mobile.contentstackapps.com";

    const newRequest = new Request(url, request);

    return fetch(newRequest);
  }

  return fetch(request);
}
