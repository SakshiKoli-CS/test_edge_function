export default async function handler(request) {
  const url = new URL(request.url);
  
  // Handle robots.txt for default domains only
  if (url.pathname === '/robots.txt') {
    const isDefaultDomain = url.hostname.includes('contentstackapps.com');
    
    console.log(`[Edge Function] robots.txt requested from: ${url.hostname}`);
    console.log(`[Edge Function] Is default domain: ${isDefaultDomain}`);
    
    if (isDefaultDomain) {
      // Create dynamic robots.txt that blocks all crawlers
      const robotsTxt = `User-agent: *
Disallow: /`;
      
      console.log(`[Edge Function] ✅ Serving dynamic robots.txt - BLOCKS all crawlers`);
      
      return new Response(robotsTxt, {
        status: 200,
        headers: {
          'Content-Type': 'text/plain',
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        }
      });
    }
    
    // For custom domains, normal behavior - pass through
    console.log(`[Edge Function] Custom domain - normal behavior`);
    return fetch(request);
  }
  
  // For all other requests, normal behavior
  return fetch(request);
}
