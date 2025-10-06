export default async function handler(request) {
  const userAgentHeader = request.headers.get('User-Agent');
  const targetUrl = new URL(request.url);
  
  console.log('Request Method:', request.method);
  console.log('Request URL:', request.url);
  
  // Fetch data from API route
  const apiUrl = new URL('/api/data', targetUrl.origin);
  console.log('API URL:', apiUrl.toString());
  
  try {
    // Method 3: fetch(apiUrl, new Request(apiUrl)) with x-request-origin header
    const apiRequest = new Request(apiUrl, {
      method: 'GET',
      headers: {
        'x-request-origin': request.headers.get('x-request-origin')
      }
    });
    
    const apiResponse = await fetch(apiUrl, apiRequest);
    console.log('API Response Status:', apiResponse.status);
    
    const apiData = await apiResponse.json();
    console.log('API data received:', apiData);
    
    // Use the API data to determine hosts
    const hosts = apiData.hosts;
    if (isMobile(userAgentHeader)) {
      targetUrl.hostname = hosts.mobile;
      console.log('Mobile detected - redirecting to:', targetUrl.hostname);
    } else {
      targetUrl.hostname = hosts.desktop;
      console.log('Desktop detected - redirecting to:', targetUrl.hostname);
    }
    
  } catch (error) {
    console.error('Error fetching API data:', error);
    return fetch(request);
  }

  const response = await fetch(new Request(targetUrl, request));
  console.log('Final response status:', response.clone().status);
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