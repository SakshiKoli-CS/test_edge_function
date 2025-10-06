# Edge Function Fetch Patterns - Technical Documentation

## Overview

This document explains different `fetch()` patterns tested in Contentstack Launch Edge Functions and why certain approaches work while others fail when calling internal API routes.

---

## The Problem

When making fetch calls from an Edge Function to an internal Next.js API route on Contentstack Launch, certain patterns fail with:
- **404 Not Found** errors
- **SyntaxError: Unexpected end of JSON input**

### Initial Failing Code

```javascript
// ❌ FAILS - Returns 404
const apiResponse = await fetch('https://testedgefunction.devcontentstackapps.com/api/data');

// ❌ FAILS - Returns 404
const apiResponse = await fetch(apiUrl, new Request(apiUrl));

// ❌ FAILS - Returns 404
const apiResponse = await fetch(apiUrl);
```

---

## The Solution

The critical requirement is passing the **`x-request-origin`** header with value `launch_cdn_cloudflare`. This header identifies the request as coming from within the Launch infrastructure.

### Working Code

```javascript
// ✅ WORKS - With x-request-origin header
const apiResponse = await fetch('https://testedgefunction.devcontentstackapps.com/api/data', {
  method: 'GET',
  headers: {
    'x-request-origin': request.headers.get('x-request-origin')
  }
});
```

---

## Fetch Pattern Comparison

### Method 1: Request Object with Original Request (Auto-Working)

```javascript
// ✅ WORKS - Automatically includes all headers from original request
const apiUrl = new URL('/api/data', targetUrl.origin);
const apiResponse = await fetch(new Request(apiUrl, request));
```

**Why it works:**
- Passes the entire original `request` object as the second parameter
- Automatically copies ALL headers, including `x-request-origin`
- No manual header management needed

---

### Method 2: URL Object with Original Request

```javascript
// ✅ WORKS - URL object with original request
const apiUrl = new URL('/api/data', targetUrl.origin);
const apiResponse = await fetch(apiUrl, request);
```

**Why it works:**
- Similar to Method 1, passes the original request object
- Automatically includes `x-request-origin` header

---

### Method 3: New Request with Explicit Headers

```javascript
// ✅ WORKS - With explicit x-request-origin header
const apiUrl = new URL('/api/data', targetUrl.origin);
const apiRequest = new Request(apiUrl, {
  method: 'GET',
  headers: {
    'x-request-origin': request.headers.get('x-request-origin')
  }
});
const apiResponse = await fetch(apiUrl, apiRequest);
```

**Why it works:**
- Explicitly sets the required `x-request-origin` header
- Creates a fresh Request object with only necessary headers

---

### Method 4: Direct URL String with Headers

```javascript
// ✅ WORKS - Direct URL with explicit headers
const apiResponse = await fetch('https://testedgefunction.devcontentstackapps.com/api/data', {
  method: 'GET',
  headers: {
    'x-request-origin': request.headers.get('x-request-origin')
  }
});
```

**Why it works:**
- Explicitly passes the `x-request-origin` header
- Uses direct URL string (can be hardcoded or dynamic)

---

### Method 5: Without Headers (Fails)

```javascript
// ❌ FAILS - No x-request-origin header
const apiResponse = await fetch('https://testedgefunction.devcontentstackapps.com/api/data');

// ❌ FAILS - No x-request-origin header
const apiResponse = await fetch(apiUrl.toString());

// ❌ FAILS - No x-request-origin header
const apiResponse = await fetch(apiUrl, new Request(apiUrl));
```

**Why it fails:**
- Missing `x-request-origin` header
- Launch infrastructure treats it as external request
- Returns 404 because routing layer doesn't recognize it as internal

---

## Technical Explanation

### The `x-request-origin` Header

**Purpose:** Identifies requests originating from within the Contentstack Launch infrastructure.

**Value:** `launch_cdn_cloudflare`

### Architecture Flow

```
User Request
    ↓
CloudFlare CDN (Edge Network)
    ↓
Edge Function ([proxy].edge.js)
    ↓ [fetch with x-request-origin header]
    ↓
Next.js Application (API routes, pages)
```

---

## Complete Headers Reference

### All Headers Available in Edge Function Request

When a request reaches your edge function, these headers are available from `request.headers`:

#### Launch-Specific Headers

| Header | Example Value | Required for API Fetch | Description |
|--------|---------------|------------------------|-------------|
| `x-request-origin` | `launch_cdn_cloudflare` | ✅ **YES** | **Critical** - Identifies internal Launch requests |
| `x-launch-deploymentuid` | `68e3792469ff8af04954863d` | ❌ No | Launch deployment identifier |
| `x-real-ip` | `52.35.48.83` | ❌ No | Real client IP address |
| `x-forwarded-for` | `52.35.48.83` | ❌ No | Client IP forwarding chain |
| `x-forwarded-proto` | `https` | ❌ No | Original protocol (http/https) |

#### CloudFlare CDN Headers

| Header | Example Value | Required for API Fetch | Description |
|--------|---------------|------------------------|-------------|
| `cf-ray` | `98a3af852dd1ef20` | ❌ No | CloudFlare request trace ID |
| `cf-visitor` | `{"scheme":"https"}` | ❌ No | Visitor connection scheme |
| `cf-connecting-ip` | `52.35.48.83` | ❌ No | Client IP from CloudFlare |
| `cf-ipcountry` | `US` | ❌ No | Client country code |

#### Geographic/Visitor Headers

| Header | Example Value | Required for API Fetch | Description |
|--------|---------------|------------------------|-------------|
| `visitor-ip-country` | `US` | ❌ No | Client country |
| `visitor-ip-region` | `Oregon` | ❌ No | Client region/state |
| `visitor-ip-city` | `Boardman` | ❌ No | Client city |

#### Standard HTTP Headers

| Header | Example Value | Required for API Fetch | Description |
|--------|---------------|------------------------|-------------|
| `host` | `testedgefunction.contentstackapps.com` | ❌ No | Target hostname |
| `user-agent` | `launch-agent` or browser UA | ❌ No | Client user agent |
| `accept` | `text/html,application/xhtml+xml,...` | ❌ No | Accepted content types |
| `accept-encoding` | `gzip, deflate, br` | ❌ No | Accepted encodings |
| `accept-language` | `en-US,en;q=0.9` | ❌ No | Accepted languages |
| `connection` | `Keep-Alive` | ❌ No | Connection type |
| `referer` | `https://example.com/` | ❌ No | Referring page URL |
| `cookie` | `session=abc123; ...` | ❌ No | Client cookies |

#### Browser Security Headers

| Header | Example Value | Required for API Fetch | Description |
|--------|---------------|------------------------|-------------|
| `sec-fetch-site` | `none` / `same-origin` / `cross-site` | ❌ No | Request initiator relationship |
| `sec-fetch-mode` | `navigate` / `no-cors` / `cors` | ❌ No | Request mode |
| `sec-fetch-dest` | `document` / `script` / `image` | ❌ No | Request destination |
| `sec-fetch-user` | `?1` | ❌ No | User-activated navigation |
| `sec-ch-ua` | `"Chrome";v="141",...` | ❌ No | Client hints - user agent |
| `sec-ch-ua-mobile` | `?0` | ❌ No | Client hints - mobile device |
| `sec-ch-ua-platform` | `"macOS"` | ❌ No | Client hints - platform |

#### Other Headers

| Header | Example Value | Required for API Fetch | Description |
|--------|---------------|------------------------|-------------|
| `upgrade-insecure-requests` | `1` | ❌ No | Upgrade HTTP to HTTPS |
| `priority` | `u=0, i` | ❌ No | Request priority hint |
| `cache-control` | `max-age=0` | ❌ No | Cache directives |
| `if-none-match` | `W/"659-199b891d8b0"` | ❌ No | Conditional request ETag |
| `if-modified-since` | `Mon, 06 Oct 2025 08:09:50 GMT` | ❌ No | Conditional request date |
| `origin` | `https://example.com` | ❌ No | Request origin for CORS |

---

### Testing Results: Which Headers Are Actually Required?

We systematically tested each header individually and in combinations:

#### ✅ Test Results - Headers That Work

| Test | Headers Included | Status | Result |
|------|------------------|--------|--------|
| **Test 1** | Only `x-launch-deploymentuid` | 404 | ❌ Failed |
| **Test 2** | Only `host` | 404 | ❌ Failed |
| **Test 3** | Only `x-request-origin` | 200 | ✅ **SUCCESS** |
| **Test 4** | `x-launch-deploymentuid` + `host` | 404 | ❌ Failed |
| **Test 5** | `x-launch-deploymentuid` + `x-request-origin` | 200 | ✅ Success |
| **Test 6** | All Launch/CloudFlare headers | 200 | ✅ Success |

#### 🎯 Key Finding

**Only `x-request-origin` is required!**

All other headers are optional and do not affect the ability to fetch internal API routes.

---

### Why Only `x-request-origin` Matters

#### Without `x-request-origin`:

1. Edge function makes fetch request
2. Launch CDN receives the request
3. CDN treats it as **external request** from internet
4. Routing layer looks for the path in CDN cache/routing table
5. Path not found in external routing → **404 Error**
6. HTML error page returned instead of JSON
7. JSON parsing fails → **SyntaxError: Unexpected end of JSON input**

#### With `x-request-origin`:

1. Edge function makes fetch request with header
2. Launch CDN receives the request
3. CDN recognizes `x-request-origin: launch_cdn_cloudflare`
4. Routing layer identifies it as **internal request**
5. Request bypasses CDN routing and goes **directly to Next.js app**
6. API route processes request → **200 OK**
7. JSON response returned successfully ✅

### Security & Performance Benefits

1. **Prevents Infinite Loops**: Edge functions can't accidentally create request loops
2. **Internal Routing**: Uses faster internal routing instead of external CDN routing
3. **Security**: Only requests from within Launch infrastructure have this header
4. **Bypass Caching**: Internal requests can skip CDN caching layers when needed

---

### Example: Logging All Request Headers

If you want to see all available headers in your edge function:

```javascript
export default async function handler(request) {
  console.log('=== ALL REQUEST HEADERS ===');
  for (const [key, value] of request.headers.entries()) {
    console.log(`${key}: ${value}`);
  }
  console.log('===========================');
  
  // Your edge function logic here
}
```

## Best Practices

### ✅ DO

1. **Always include `x-request-origin` header** when fetching internal API routes from edge functions
   ```javascript
   headers: {
     'x-request-origin': request.headers.get('x-request-origin')
   }
   ```

2. **Use Method 4 (Direct URL with headers)** for clarity and maintainability
   ```javascript
   const apiResponse = await fetch(apiUrl, {
     method: 'GET',
     headers: {
       'x-request-origin': request.headers.get('x-request-origin')
     }
   });
   ```

3. **Use dynamic URL construction** for environment flexibility
   ```javascript
   const apiUrl = new URL('/api/data', new URL(request.url).origin);
   ```

4. **Add proper error handling**
   ```javascript
   try {
     const apiResponse = await fetch(apiUrl, { headers: { ... } });
     if (!apiResponse.ok) {
       throw new Error(`API returned ${apiResponse.status}`);
     }
     const data = await apiResponse.json();
   } catch (error) {
     console.error('API fetch failed:', error);
     // Fallback logic
   }
   ```

---

## Conclusion

For Contentstack Launch Edge Functions calling internal API routes:

1. **Always use `x-request-origin` header** when making internal fetch calls
2. **Recommended pattern:** Method 4 (direct URL with explicit headers)
3. **Why it matters:** Enables proper internal routing and prevents 404 errors
4. **Security benefit:** Identifies trusted internal requests

