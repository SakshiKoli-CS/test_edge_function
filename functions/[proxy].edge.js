export default async function handler(request, context) {
  try {
    const currentUrl = new URL(request.url);
    
    const hostname = currentUrl.hostname;
    
    if (hostname.includes('contentstackapps.com')) {
      return new Response('Forbidden', {
        status: 403,
        statusText: 'Forbidden',
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
