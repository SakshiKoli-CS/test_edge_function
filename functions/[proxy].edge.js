import Personalize from '@contentstack/personalize-edge-sdk';
import getRedirects from '../redirects.mjs';

// Helper function to add security headers to responses
const addSecurityHeaders = (response) => {
  if (!response) return response;

  // Create a new response with security headers
  const headers = new Headers(response.headers);

  // Remove X-Powered-By header to prevent information leakage
  headers.delete('X-Powered-By');

  // Add security headers (matching next.config.mjs)
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  headers.set('X-XSS-Protection', '1; mode=block');

  // Only add HSTS if not already present (to avoid duplicates)
  if (!headers.has('Strict-Transport-Security')) {
    headers.set(
      'Strict-Transport-Security',
      's-maxage=63072000; includeSubDomains; preload',
    );
  }

  // Create new response with updated headers
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: headers,
  });
};
// AI bot user agents that should receive cached default HTML (no personalization).
// Keep in sync with app/robots.ts allow list for AI crawlers.
const AI_BOT_USER_AGENTS = [
  'GPTBot',
  'ChatGPT-User',
  'CCBot',
  'anthropic-ai',
  'Claude-Web',
  'ClaudeBot',
  'Claude-Instant',
  'Omgilibot',
  'Applebot',
  'Google-Extended',
  'Bytespider',
  'PerplexityBot',
  'YouBot',
  'Amazonbot',

  // search engines
  'Googlebot',
  'Bingbot',
  'DuckDuckBot',

  // social crawlers
  'facebookexternalhit',
  'Twitterbot',
  'LinkedInBot',
];

function isAIBotRequest(userAgent) {
  if (!userAgent || typeof userAgent !== 'string') return false;
  const ua = userAgent.toLowerCase();
  return AI_BOT_USER_AGENTS.some((bot) => ua.includes(bot.toLowerCase()));
}

export default async function handler(request, context) {
  return await main(request, context);
}

const main = async (request, context) => {
  const [req1, req2, req3, req4, req5] = [
    request.clone(),
    request.clone(),
    request.clone(),
    request.clone(),
    request.clone(),
  ];

  const parsedUrl = new URL(req1?.url);
  const pathname = parsedUrl?.pathname.toString();

  let response;

  if (
    (pathname.startsWith('/api/') || pathname.startsWith('/api')) &&
    !pathname.startsWith('/api/docs/changelog/rss.xml')
  ) {
    // For Contentstack Launch, API routes are usually handled by the framework (Next.js)
    // We should let the framework handle it by just fetching the request
    response = await fetch(request);
    response = addSecurityHeaders(response);
  } else {
    const redirectResponse = await redirects(req3, context);
    if (redirectResponse && redirectResponse.status !== 200) {
      response = redirectResponse;
    } else {
      // Handle double slash URLs to prevent SecurityError
      if (pathname.includes('//')) {
        const cleanedPath = pathname.replace(/\/+/g, '/');
        if (cleanedPath !== pathname) {
          const redirectUrl = new URL(request.url);
          redirectUrl.pathname = cleanedPath;
          response = Response.redirect(redirectUrl.toString(), 301);
        } else {
          response = await personalizeHandler(req4, context);
        }
      } else {
        response = await personalizeHandler(req4, context);
      }
    }
  }

  // Log to Profound AI (non-blocking)
  // logToProfoundAI(req5, response);

  // Ensure security headers are present on final response
  // Note: Redirects don't need X-Content-Type-Options, but we'll add it for consistency
  return addSecurityHeaders(response);
};

// Removed internalApiRouter and apiHandler as they are not needed for standard Next.js deployments on Launch

const redirects = async (request, context) => {
  try {
    const modifiedUrl = new URL(request.url);
    const route = modifiedUrl?.toString()?.startsWith('/https://')
      ? modifiedUrl?.toString()?.substring(1)
      : modifiedUrl.pathname;
    const redirectsData = (await getRedirects(context)) || [];
    for (const redirect of redirectsData) {
      if (route === redirect.source && request.method === 'GET') {
        if (redirect.destination.includes('https')) {
          const destinationUrl = redirect.destination;
          return Response.redirect(decodeURIComponent(destinationUrl), 308);
        } else {
          modifiedUrl.pathname = redirect.destination;
          return Response.redirect(decodeURIComponent(modifiedUrl), 308);
        }
      }
    }
    const fetchResponse = await fetch(request);
    return addSecurityHeaders(fetchResponse);
  } catch (error) {
    console.error('Redirects ERROR:\n', error);
    const fetchResponse = await fetch(request);
    return addSecurityHeaders(fetchResponse);
  }
};

const personalizeHandler = async (request, context) => {
  const parsedUrl = new URL(request?.url);
  const pathname = parsedUrl?.pathname.toString();

  try {
    if (
      ['_next', 'favicon.ico', 'static', 'image', 'docs', 'podcasts'].some(
        (path) => pathname.includes(path),
      )
    ) {
      const fetchResponse = await fetch(request);
      return addSecurityHeaders(fetchResponse);
    }
    // AI bots get default HTML without personalization so CDN can cache one response per path
    const userAgent = request.headers.get('user-agent') || '';
    if (isAIBotRequest(userAgent)) {
      return fetch(request);
    }
    if (context.env.NEXT_PUBLIC_CONTENTSTACK_PERSONALIZE_EDGE_API_URL) {
      Personalize.setEdgeApiUrl(
        context.env.NEXT_PUBLIC_CONTENTSTACK_PERSONALIZE_EDGE_API_URL,
      );
    }

    const personalizeSdk = await Personalize.init(
      context.env.NEXT_PUBLIC_CONTENTSTACK_PERSONALIZE_PROJECT_UID,
      {
        request,
      },
    );

    const variantParam = personalizeSdk.getVariantParam();
    parsedUrl.searchParams.set(
      personalizeSdk.VARIANT_QUERY_PARAM,
      variantParam,
    );

    const modifiedRequest = new Request(parsedUrl.toString(), request);
    const response = await fetch(modifiedRequest);

    const modifiedResponse = new Response(response.body, response);

    personalizeSdk.addStateToResponse(modifiedResponse);
    // modifiedResponse.headers.set('cache-control', 'no-store');

    // Ensure security headers are present
    return addSecurityHeaders(modifiedResponse);
  } catch (error) {
    console.log('Personalize ERROR:\n', error);
    const fetchResponse = await fetch(request);
    return addSecurityHeaders(fetchResponse);
  }
};

// Profound AI Logging Function
const logToProfoundAI = async (request, response) => {
  try {
    // Extract request information for logging
    const url = new URL(request.url);
    const method = request.method;
    const host = url.hostname;
    const path = url.pathname + url.search;
    const userAgent = request.headers.get('user-agent') || '';
    console.log('url', url);
    console.log('method', method);
    console.log('host', host);
    console.log('path', path);
    console.log('userAgent', userAgent);
    console.log('request.headers', request.headers);
    console.log('response', response);
    // Get client IP (handling various proxy headers)
    const clientIP =
      request.headers.get('x-forwarded-for')?.split(',')[0] ||
      request.headers.get('x-real-ip') ||
      request.headers.get('cf-connecting-ip') ||
      'unknown';

    // Create log entry
    const logEntry = {
      timestamp: new Date().toISOString(),
      method: method,
      host: host,
      path: path,
      status_code: response?.status || 200,
      ip: clientIP,
      user_agent: userAgent,
      headers: Object.fromEntries(request.headers.entries()),
    };

    // Send logs to Profound AI (non-blocking)
    fetch('https://artemis.api.tryprofound.com/v1/logs/custom', {
      method: 'POST',
      headers: {
        'x-api-key': 'bot_e321560a-9cad-43f0-aeab-9811a046362a',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([logEntry]),
    })
      .then((logResponse) => {
        if (!logResponse.ok) {
          console.error(
            'Failed to send logs to Profound AI:',
            logResponse.status,
            logResponse.statusText,
          );
        }
      })
      .catch((error) => {
        console.error('Error sending logs to Profound AI:', error);
      });
  } catch (error) {
    console.error('Error in Profound AI logging:', error);
  }
};