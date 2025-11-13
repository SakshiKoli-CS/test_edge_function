// Previous rewrite logic (commented out)
// export default async function handler(request, context) {
//   try {
//     const currentUrl = new URL(request.url);
//     
//     const hostname = currentUrl.hostname;
//     
//     if (hostname.includes('contentstackapps.com')) {
//       return new Response('Forbidden', {
//         status: 403,
//         statusText: 'Forbidden',
//       });
//     }
//     
//     const apiUrl = `${currentUrl.protocol}//${currentUrl.host}/api/rewrite`;
//     const response = await fetch(new Request(apiUrl, request));
//     const rewrites = response.ok ? await response.json() : [];
//     const rewrite = rewrites.find(rule => rule.source === currentUrl.pathname);
//     
//     if (rewrite) {
//       const newUrl = new URL(request.url);
//       newUrl.pathname = rewrite.destination;
//       
//       const newRequest = new Request(newUrl.toString(), request);
//       return fetch(newRequest);
//     }
//     
//     return fetch(request);
//     
//   } catch (error) {
//     return fetch(request);
//   }
// }

// Current robots.txt handler
export default async function handler(request) {
  const url = new URL(request.url);
  
  if (url.pathname === '/robots.txt') {
    const isDefaultDomain = url.hostname.includes('contentstackapps.com') || 
                            url.hostname.includes('localhost');
    
    console.log(`[Edge Function] robots.txt requested from: ${url.hostname}`);
    console.log(`[Edge Function] Is default domain: ${isDefaultDomain}`);
    
    if (isDefaultDomain) {
      console.log(`[Edge Function] ✅ Serving robots.txt - PREVENTS crawling & indexing`);
      return fetch(request);
    }
    
    console.log(`[Edge Function] ❌ Returning 404 for custom domain`);
    return new Response('Not Found', { status: 404 });
  }
  
  return fetch(request);
}
