export default async function handler(request) {
  const url = new URL(request.url);
  
  if (url.pathname === '/robots.txt' && url.hostname.includes('contentstackapps.com')) {
    return new Response(`User-agent: *
Disallow: /`, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });
  }
  
  return fetch(request);
}
