# Cache Priming vs URL Rewrites: x-launch-deploymentuid Header Conflict

## Summary
**CRITICAL ISSUE**: URL rewrites to external hosts fail due to our cache priming feature adding `x-launch-deploymentuid` headers. Current workaround exists but proper solution needed.

## Problem Description
We implemented URL rewrites to redirect traffic between mobile and desktop hosts:
- **Mobile Host**: `edge-device-adaptation-mobile.contentstackapps.com` 
- **Desktop Host**: `testedgefunction.contentstackapps.com`

### Issues Encountered:

#### 1. Launch.json Rewrites Not Working
- Created `launch.json` with simple rewrite rule:
```json
{
  "rewrites": [
    {
      "source": "/test",
      "destination": "https://edge-device-adaptation-mobile.contentstackapps.com"
    }
  ]
}
```
- **Result**: Rewrites fail to work properly
- **Observation**: Can see requests hitting the mobile host URL in monitoring/observability tools, but content not served correctly

#### 2. Edge Function Rewrites Initially Failing  
- Implemented proxy edge function with User-Agent based routing
- **Result**: Initially failed to work properly
- **Observation**: Same issue - requests visible in logs but content not served

## Root Cause Discovery
The issue is NOT with Contentstack Launch automatically adding headers. 

**ACTUAL ROOT CAUSE**: Our **cache priming feature** is adding the `x-launch-deploymentuid` header to requests, which prevents successful rewrites to external hosts.

## Current Workaround (NOT A SOLUTION)
**TEMPORARY HACK**: Remove the header that our cache priming feature adds:

```javascript
// In [proxy].edge.js - ADD THIS LINE:
newRequest.headers.delete('x-launch-deploymentuid');
```

**Complete Working Code:**
```javascript
const newRequest = new Request(targetUrl.toString(), {
  method: request.method,
  headers: request.headers,
  body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : undefined
});

// 🔑 CRITICAL: This line MUST be added for rewrites to work
newRequest.headers.delete('x-launch-deploymentuid');

return fetch(newRequest);
```

**Before Workaround**: ❌ Edge function without `headers.delete()` = Rewrites fail  
**After Workaround**: ✅ Edge function with `headers.delete()` = Rewrites work (but this is a hack)

## Technical Analysis
1. **Header Source**: Our **cache priming feature** is adding `x-launch-deploymentuid` to requests
2. **Problem**: External destination servers reject or mishandle requests with this header
3. **Impact**: Causes rewrite failures even though requests reach destination servers  
4. **Current Workaround**: Strip the header before forwarding (but this defeats cache priming purpose)
5. **Real Issue**: Cache priming feature conflicts with URL rewrites to external hosts

## Current Status
- ✅ **Edge Function WITH headers.delete()**: Working (but using workaround) ⚠️
- ❌ **Edge Function WITHOUT headers.delete()**: Does not work ❌  
- ❌ **Launch.json rewrites**: Still not working (cache priming issue) ❌

**The Temporary Workaround**: Adding `newRequest.headers.delete('x-launch-deploymentuid');` makes rewrites work, but this may break cache priming functionality.

---

## ⚠️ CRITICAL TEAM DISCUSSION NEEDED

**The Problem**: Our cache priming feature adds `x-launch-deploymentuid` headers, but external hosts can't handle these headers.

**Current Hack**: 
```javascript
newRequest.headers.delete('x-launch-deploymentuid'); // Removes cache priming header
return fetch(newRequest); 
```

**Questions for Team Discussion:**
1. **Does removing this header break our cache priming feature?**
2. **Can we modify cache priming to not add this header for external rewrites?**
3. **Should we detect external vs internal requests and handle headers differently?**
4. **What's the proper architectural solution here?**

---

## Recommendations
1. **Immediate**: Use current workaround for testing
2. **URGENT**: Schedule team meeting to discuss proper solution
3. **Architecture Review**: How should cache priming work with external URL rewrites?
4. **Options to Evaluate**:
   - Conditional header addition in cache priming
   - Different handling for internal vs external rewrites
   - Alternative cache priming strategies

## Environment Details
- **Platform**: Contentstack Launch
- **Function Type**: Edge Function ([proxy].edge.js)
- **Hosts**: 
  - Mobile: `edge-device-adaptation-mobile.contentstackapps.com`
  - Desktop: `testedgefunction.contentstackapps.com`

## Next Steps
- [ ] **URGENT**: Schedule team discussion about cache priming vs URL rewrites
- [ ] Analyze impact of removing `x-launch-deploymentuid` on cache priming functionality  
- [ ] Design proper solution that supports both cache priming AND external rewrites
- [ ] Evaluate architectural options (conditional headers, internal vs external detection, etc.)
- [ ] Implement proper solution to replace current workaround
- [ ] Test that cache priming still works with proper solution
- [ ] Document final solution for future reference

## Action Items for Team Meeting
1. **Review cache priming implementation** - why does it add deployment UID?
2. **Assess impact** - what breaks if we remove the header?
3. **Design solution** - how to handle internal vs external rewrites?
4. **Timeline** - when can we implement proper fix vs workaround?

## Code References
- **Working Edge Function**: `/functions/[proxy].edge.js`
- **Non-working Launch Config**: `/launch.json`
