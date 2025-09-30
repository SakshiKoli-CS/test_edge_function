const mobileHost = "dynamiclaunch.devcontentstackapps.com";
const webHost = "testedgefunction.contentstackapps.com";

export default async function handler(request) {
  const userAgentHeader = request.headers.get('User-Agent');
  const targetUrl = new URL(request.url);
  if (isMobile(userAgentHeader)) {
    targetUrl.hostname = mobileHost;
  } else {
    targetUrl.hostname = webHost;
  }

  const rewrittenUrl = targetUrl.toString();
  const newRequest = new Request(rewrittenUrl, request);
  // newRequest.headers.delete('x-launch-deploymentuid');
  return fetch(newRequest);
}

function isMobile(userAgent) {
  const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
  return mobileRegex.test(userAgent);
}
