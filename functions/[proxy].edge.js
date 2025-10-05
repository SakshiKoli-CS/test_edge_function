export default async function handler(request) {
  const userAgentHeader = request.headers.get('User-Agent');
  const targetUrl = new URL(request.url);
  
  // Fetch data from API route
  console.log('Fetching data from API');
  
  try {
    const apiResponse = await fetch('https://testedgefunction.devcontentstackapps.com/api/data');
    const apiData = await apiResponse.json();
    console.log('API data received:', apiData);
    
    // Use the API data to determine hosts
    const hosts = apiData.hosts;
    if (isMobile(userAgentHeader)) {
      targetUrl.hostname = hosts.mobile;
    } else {
      targetUrl.hostname = hosts.desktop;
    }
    
  } catch (error) {
    console.error('Error fetching API data:', error);
    // No fallback - return original request
    console.log('No rewrite performed due to API error');
    return fetch(request);
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


// const response = await fetch(new Request(targetUrl, request));
// console.log('response status', response.clone().status);
// return response;