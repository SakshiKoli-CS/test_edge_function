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

    let response;
    try {
      response = JSON.parse(text);
    } catch (e) {
      response = { originalResponse: text };
    }
    
    response = {
      ...response,
      time: new Date(),
      envVariableValue: envVariable,
    }

    return new Response(JSON.stringify(response), {
      status: res.status,
      headers: {
        'X-Message': 'Change response headers',
        'Content-Type': 'application/json'
      }
    })
  }
  return fetch(req)
}

export const config = {
  runtime: 'edge',
}
