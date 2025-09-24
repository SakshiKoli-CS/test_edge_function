const mobileHost = "edge-device-adaptation-mobile.contentstackapps.com";
const webHost = "exampleeu.eu-contentstackapps.com"; // Temporary working domain

export default async function handler(request) {
  const userAgentHeader = request.headers.get('User-Agent');
  const originalUrl = new URL(request.url);
  
  const targetUrl = new URL(originalUrl);
  if (isMobile(userAgentHeader)) {
    targetUrl.hostname = mobileHost;
  } else {
    targetUrl.hostname = webHost;
  }

  const headers = new Headers();
  headers.set("Host", targetUrl.host);

  // Create a completely new request instead of modifying existing one
  const newRequest = new Request(targetUrl.toString(), {
    method: request.method,
    headers: headers,
    body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : undefined
  });

  // Log debug info
  console.log("User-Agent:", userAgentHeader);
  console.log("Device:", isMobile(userAgentHeader) ? "Mobile" : "Desktop");
  console.log("Target URL:", targetUrl.toString());
  console.log("Host header:", targetUrl.host);

  return fetch(newRequest);
}

function isMobile(userAgent) {
  const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
  return mobileRegex.test(userAgent);
}

export const config = {
  runtime: 'edge',
}
