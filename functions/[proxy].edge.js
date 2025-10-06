export default async function handler(request) {
  const userAgentHeader = request.headers.get('User-Agent');
  const targetUrl = new URL(request.url);
  
  // Log original request details
  console.log('Request Method:', request.method);
  console.log('Request URL:', request.url);
  
  // Fetch data from API route - use the same origin as the incoming request
  const apiUrl = new URL('/api/data', targetUrl.origin);
  console.log('API URL:', apiUrl.toString());
  
  try {
    // Method 1 (Working): fetch(new Request(apiUrl, request))
    const apiResponse = await fetch(new Request(apiUrl, request));
    console.log('Method 1 - API Response Status:', apiResponse.status);
    const apiData = await apiResponse.json();
    console.log('Method 1 - API data received:', apiData);
    
    // Test Method 3: fetch(apiUrl, new Request(apiUrl))
    console.log('\n=== Testing Method 3 ===');
    try {
      const method3Response = await fetch(apiUrl, new Request(apiUrl));
      console.log('Method 3 - Status:', method3Response.status);
      const method3Data = await method3Response.json();
      console.log('Method 3 - Data:', method3Data);
    } catch (err) {
      console.error('Method 3 - Error:', err.message);
    }
    
    // Test Method 4: fetch(apiUrl.toString())
    console.log('\n=== Testing Method 4 ===');
    try {
      const method4Response = await fetch(apiUrl.toString());
      console.log('Method 4 - Status:', method4Response.status);
      const method4Data = await method4Response.json();
      console.log('Method 4 - Data:', method4Data);
    } catch (err) {
      console.error('Method 4 - Error:', err.message);
    }
    
    // Test Method 4 with explicit GET and headers
    console.log('\n=== Testing Method 4 with Headers ===');
    try {
      const method4HeadersResponse = await fetch(apiUrl.toString(), {
        method: 'GET',
        headers: {
          'User-Agent': request.headers.get('User-Agent') || 'EdgeFunction/1.0',
          'Accept': 'application/json'
        }
      });
      console.log('Method 4 (with headers) - Status:', method4HeadersResponse.status);
      const method4HeadersData = await method4HeadersResponse.json();
      console.log('Method 4 (with headers) - Data:', method4HeadersData);
    } catch (err) {
      console.error('Method 4 (with headers) - Error:', err.message);
    }
    
    // Use the API data to determine hosts
    const hosts = apiData.hosts;
    if (isMobile(userAgentHeader)) {
      targetUrl.hostname = hosts.mobile;
    } else {
      targetUrl.hostname = hosts.desktop;
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