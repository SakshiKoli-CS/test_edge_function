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

  const response = await fetch(new Request(targetUrl, request));
  console.log('response status', response.clone().status);
  return response;
}

function isMobile(userAgent) {
  const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
  return mobileRegex.test(userAgent);
}


// const newRequest = new Request(targetUrl.toString(), {
//   method: request.method,
//   headers: request.headers,
//   body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : undefined
// });



// const newRequest = new Request(targetUrl.toString(), request);
// return fetch(newRequest);