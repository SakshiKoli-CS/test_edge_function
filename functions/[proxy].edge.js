/**
 * Contentstack Launch Edge Function - redirects via mapping.
 * @see https://www.contentstack.com/docs/developers/launch/edge-functions
 */

// Source hostname → redirect URL (302 temporary)
const REDIRECT_MAP = {
  'colts-abcd.contentstackapps.com': 'https://pqr.contentstackapps.com/community/colts-neck',
  // Add more: 'source-host.com': 'https://target.com/path',
};

export default function handler(request) {
  const url = new URL(request.url);
  const hostname = url.hostname.toLowerCase();

  const redirectUrl = REDIRECT_MAP[hostname];
  if (redirectUrl) {
    return Response.redirect(redirectUrl, 302);
  }

  // No redirect, forward to origin
  return fetch(request);
}
