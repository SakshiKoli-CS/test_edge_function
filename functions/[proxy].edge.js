export default async function handler(request) {
  const userAgentHeader = request.headers.get('User-Agent');
  const targetUrl = new URL(request.url);
  
  // Log original request details
  console.log('=== ORIGINAL REQUEST DETAILS ===');
  console.log('Method:', request.method);
  console.log('URL:', request.url);
  console.log('Headers:');
  for (const [key, value] of request.headers.entries()) {
    console.log(`  ${key}: ${value}`);
  }
  console.log('================================');
  
  // Fetch data from API route
  const apiUrl = 'https://testedgefunction.devcontentstackapps.com/api/data';
  console.log('Fetching data from API:', apiUrl);
  
  try {
    const apiResponse = await fetch(new Request(apiUrl, request));
    console.log('API Response Status:', apiResponse.status);
    console.log('API Response Headers:');
    for (const [key, value] of apiResponse.headers.entries()) {
      console.log(`  ${key}: ${value}`);
    }
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

  // Test methods 3 & 4 with explicit headers
  console.log('\n=== TESTING METHOD 4 (direct URL) ===');
  try {
    const test4Response = await fetch('https://testedgefunction.devcontentstackapps.com/api/data');
    console.log('Method 4 - Status:', test4Response.status);
    console.log('Method 4 - Headers:');
    for (const [key, value] of test4Response.headers.entries()) {
      console.log(`  ${key}: ${value}`);
    }
    const test4Text = await test4Response.text();
    console.log('Method 4 - Response body:', test4Text.substring(0, 200));
  } catch (error) {
    console.error('Method 4 - Error:', error.message);
  }
  
  console.log('\n=== TESTING METHOD 3 (with new Request) ===');
  try {
    const test3Response = await fetch(apiUrl, new Request(apiUrl));
    console.log('Method 3 - Status:', test3Response.status);
    console.log('Method 3 - Headers:');
    for (const [key, value] of test3Response.headers.entries()) {
      console.log(`  ${key}: ${value}`);
    }
    const test3Text = await test3Response.text();
    console.log('Method 3 - Response body:', test3Text.substring(0, 200));
  } catch (error) {
    console.error('Method 3 - Error:', error.message);
  }
  
  console.log('\n=== TESTING WITH EXPLICIT GET METHOD ===');
  try {
    const testGetResponse = await fetch('https://testedgefunction.devcontentstackapps.com/api/data', {
      method: 'GET',
      headers: {
        'User-Agent': request.headers.get('User-Agent') || 'EdgeFunction/1.0'
      }
    });
    console.log('Explicit GET - Status:', testGetResponse.status);
    const testGetData = await testGetResponse.json();
    console.log('Explicit GET - Data:', testGetData);
  } catch (error) {
    console.error('Explicit GET - Error:', error.message);
  }

  const response = await fetch(new Request(targetUrl, request));
  console.log('\n=== FINAL RESPONSE ===');
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