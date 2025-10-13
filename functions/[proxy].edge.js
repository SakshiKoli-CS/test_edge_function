export default async function handler(request) {
  const userAgentHeader = request.headers.get('User-Agent');
  const targetUrl = new URL(request.url);
  
  console.log('Request Method:', request.method);
  console.log('Request URL:', request.url);
  
  // Log ALL headers and their values
  console.log('\n=== ALL REQUEST HEADERS AND VALUES ===');
  for (const [key, value] of request.headers.entries()) {
    console.log(`${key}: ${value}`);
  }
  console.log('======================================\n');
  
  // Specifically log x-request-origin value
  const xRequestOrigin = request.headers.get('x-request-origin');
  console.log('🔑 x-request-origin header value:', xRequestOrigin);
  console.log('🔑 x-request-origin exists?', xRequestOrigin !== null);
  
  try {
    // Use dynamic URL based on current request origin
    const apiUrl = new URL('/api/data', targetUrl.origin);
    console.log('API URL:', apiUrl.toString());
    
    // Test 1: WITH x-request-origin (should work)
    console.log('\n=== TEST 1: WITH x-request-origin ===');
    const test1Response = await fetch(apiUrl.toString(), {
      method: 'GET',
      headers: {
        'x-request-origin': request.headers.get('x-request-origin')
      }
    });
    console.log('Test 1 Status:', test1Response.status);
    if (test1Response.ok) {
      const test1Data = await test1Response.json();
      console.log('Test 1 SUCCESS! Data:', test1Data);
    }
    
    // Test 2: WITHOUT x-request-origin but WITH all other headers
    console.log('\n=== TEST 2: ALL HEADERS EXCEPT x-request-origin ===');
    const allHeadersExceptXRequestOrigin = {};
    for (const [key, value] of request.headers.entries()) {
      if (key !== 'x-request-origin') {
        allHeadersExceptXRequestOrigin[key] = value;
      }
    }
    console.log('Headers being sent (count):', Object.keys(allHeadersExceptXRequestOrigin).length);
    console.log('Headers being sent:', Object.keys(allHeadersExceptXRequestOrigin).join(', '));
    
    const test2Response = await fetch(apiUrl.toString(), {
      method: 'GET',
      headers: allHeadersExceptXRequestOrigin
    });
    console.log('Test 2 Status:', test2Response.status);
    if (test2Response.ok) {
      const test2Data = await test2Response.json();
      console.log('Test 2 SUCCESS! Data:', test2Data);
    } else {
      console.log('Test 2 FAILED - Status:', test2Response.status);
      const test2Text = await test2Response.text();
      console.log('Test 2 Response (first 200 chars):', test2Text.substring(0, 200));
    }
    
    // Use Test 1 data for the actual redirect logic
    const apiResponse = await fetch(apiUrl.toString(), {
      method: 'GET',
      headers: {
        'x-request-origin': request.headers.get('x-request-origin')
      }
    });
    const apiData = await apiResponse.json();
    
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