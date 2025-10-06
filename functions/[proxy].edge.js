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
    // Log ALL headers from the working request
    const workingRequest = new Request(apiUrl, request);
    console.log('\n=== WORKING REQUEST (Method 1) DETAILS ===');
    console.log('URL:', workingRequest.url);
    console.log('Method:', workingRequest.method);
    console.log('Headers:');
    for (const [key, value] of workingRequest.headers.entries()) {
      console.log(`  ${key}: ${value}`);
    }
    console.log('==========================================\n');
    
    // Method 1 (Working): fetch(new Request(apiUrl, request))
    const apiResponse = await fetch(workingRequest);
    console.log('Method 1 - API Response Status:', apiResponse.status);
    const apiData = await apiResponse.json();
    console.log('Method 1 - API data received:', apiData);
    
    // Test 1: Only x-launch-deploymentuid
    console.log('\n=== Test 1: Only x-launch-deploymentuid ===');
    try {
      const test1Response = await fetch(apiUrl.toString(), {
        method: 'GET',
        headers: {
          'x-launch-deploymentuid': request.headers.get('x-launch-deploymentuid')
        }
      });
      console.log('Test 1 - Status:', test1Response.status);
      if (test1Response.ok) {
        const test1Data = await test1Response.json();
        console.log('Test 1 - SUCCESS! Data:', test1Data);
      }
    } catch (err) {
      console.error('Test 1 - Error:', err.message);
    }
    
    // Test 2: Only host header
    console.log('\n=== Test 2: Only host ===');
    try {
      const test2Response = await fetch(apiUrl.toString(), {
        method: 'GET',
        headers: {
          'host': request.headers.get('host')
        }
      });
      console.log('Test 2 - Status:', test2Response.status);
      if (test2Response.ok) {
        const test2Data = await test2Response.json();
        console.log('Test 2 - SUCCESS! Data:', test2Data);
      }
    } catch (err) {
      console.error('Test 2 - Error:', err.message);
    }
    
    // Test 3: Only x-request-origin
    console.log('\n=== Test 3: Only x-request-origin ===');
    try {
      const test3Response = await fetch(apiUrl.toString(), {
        method: 'GET',
        headers: {
          'x-request-origin': request.headers.get('x-request-origin')
        }
      });
      console.log('Test 3 - Status:', test3Response.status);
      if (test3Response.ok) {
        const test3Data = await test3Response.json();
        console.log('Test 3 - SUCCESS! Data:', test3Data);
      }
    } catch (err) {
      console.error('Test 3 - Error:', err.message);
    }
    
    // Test 4: x-launch-deploymentuid + host
    console.log('\n=== Test 4: x-launch-deploymentuid + host ===');
    try {
      const test4Response = await fetch(apiUrl.toString(), {
        method: 'GET',
        headers: {
          'x-launch-deploymentuid': request.headers.get('x-launch-deploymentuid'),
          'host': request.headers.get('host')
        }
      });
      console.log('Test 4 - Status:', test4Response.status);
      if (test4Response.ok) {
        const test4Data = await test4Response.json();
        console.log('Test 4 - SUCCESS! Data:', test4Data);
      }
    } catch (err) {
      console.error('Test 4 - Error:', err.message);
    }
    
    // Test 5: x-launch-deploymentuid + x-request-origin
    console.log('\n=== Test 5: x-launch-deploymentuid + x-request-origin ===');
    try {
      const test5Response = await fetch(apiUrl.toString(), {
        method: 'GET',
        headers: {
          'x-launch-deploymentuid': request.headers.get('x-launch-deploymentuid'),
          'x-request-origin': request.headers.get('x-request-origin')
        }
      });
      console.log('Test 5 - Status:', test5Response.status);
      if (test5Response.ok) {
        const test5Data = await test5Response.json();
        console.log('Test 5 - SUCCESS! Data:', test5Data);
      }
    } catch (err) {
      console.error('Test 5 - Error:', err.message);
    }
    
    // Test 6: All Launch/CloudFlare headers
    console.log('\n=== Test 6: All Launch/CloudFlare headers ===');
    try {
      const test6Response = await fetch(apiUrl.toString(), {
        method: 'GET',
        headers: {
          'x-launch-deploymentuid': request.headers.get('x-launch-deploymentuid'),
          'x-request-origin': request.headers.get('x-request-origin'),
          'host': request.headers.get('host'),
          'cf-ray': request.headers.get('cf-ray'),
          'cf-visitor': request.headers.get('cf-visitor'),
          'cf-connecting-ip': request.headers.get('cf-connecting-ip'),
          'cf-ipcountry': request.headers.get('cf-ipcountry')
        }
      });
      console.log('Test 6 - Status:', test6Response.status);
      if (test6Response.ok) {
        const test6Data = await test6Response.json();
        console.log('Test 6 - SUCCESS! Data:', test6Data);
      }
    } catch (err) {
      console.error('Test 6 - Error:', err.message);
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