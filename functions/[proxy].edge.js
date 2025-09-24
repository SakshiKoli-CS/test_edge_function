export default async function handler(req, context) {
  const parsedUrl = new URL(req.url);
  const route = parsedUrl.pathname;
  const envVariable = context.env.TEST_KEY;
  
  if (route === '/test') {
    console.log("Inside /test");
    
    const target = "https://exampleeu.eu-contentstackapps.com/";

    const headers = new Headers();
    headers.set("Host", parsedUrl.host);

    const res = await fetch(new Request(target, { headers }));
    const text = await res.text();

    console.log("status", res.status);
    console.log("server", res.headers.get("server"));
    console.log("cf-cache-status", res.headers.get("cf-cache-status"));

    console.log("sample", text.slice(0, 200));

    // Return the HTML content directly (rewrite to target website)
    return new Response(text, {
      status: res.status,
      headers: {
        'Content-Type': 'text/html',
        'X-Message': 'Rewritten from ' + target
      }
    })
  }
  return fetch(req)
}

export const config = {
  runtime: 'edge',
}
