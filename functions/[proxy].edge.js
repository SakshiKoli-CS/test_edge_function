export default async function handler(request, context) {
  try {
    const currentUrl = new URL(request.url);
    
    // Block indexing only for the specific test subdomain
    if (currentUrl.hostname === 'testedgefunction-test.contentstackapps.com') {
      const res = await fetch(request);
      const headers = new Headers(res.headers);
      headers.set('X-Robots-Tag', 'noindex, nofollow');
      return new Response(res.body, {
        status: res.status,
        statusText: res.statusText,
        headers,
      });
    }
    
    const apiUrl = `${currentUrl.protocol}//${currentUrl.host}/api/rewrite`;
    const response = await fetch(new Request(apiUrl, request));
    const rewrites = response.ok ? await response.json() : [];
    const rewrite = rewrites.find(rule => rule.source === currentUrl.pathname);
    
    if (rewrite) {
      const newUrl = new URL(request.url);
      newUrl.pathname = rewrite.destination;
      
      const newRequest = new Request(newUrl.toString(), request);
      return fetch(newRequest);
    }
    
    return fetch(request);
    
  } catch (error) {
    return fetch(request);
  }
}
