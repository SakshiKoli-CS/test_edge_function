# CloudWatch Logging Troubleshooting Guide

## 🚨 Problem
Logs from the Next.js edge function are not appearing in CloudWatch despite having `launch.json` configured with a log target.

---

## ✅ Diagnostic Checklist

### 1. **Verify Log Target Configuration in Launch Console**

Go to **Launch Console → Settings → Log Targets** and verify:

- [ ] Log target named `test_logTarget` exists
- [ ] Type is set to **CloudWatch**
- [ ] AWS Region is correct (e.g., `ap-southeast-1`)
- [ ] CloudWatch Log Group name is specified
- [ ] AWS credentials are properly configured
- [ ] Log Target is in the **same organization** as your project

**Expected Configuration Example:**
```
Name: test_logTarget
Type: CloudWatch
Region: ap-southeast-1
Log Group: /launch/edge-functions/nextjs-edge-redirect
AWS Access Key: [configured]
AWS Secret Key: [configured]
```

---

### 2. **Verify Project Deployment Status**

Check if your project is actually deployed and running:

```bash
# Check deployment status
curl -I https://your-deployment-url.com/test

# Or visit in browser
# https://your-deployment-url.com/test
```

**Things to verify:**
- [ ] Project deployed successfully (no deployment errors)
- [ ] Edge function is actually executing (check response)
- [ ] Deployment uses the correct `launch.json` configuration
- [ ] No deployment errors related to logging configuration

---

### 3. **Check CloudWatch Log Group Exists**

In AWS Console → CloudWatch → Log Groups:

- [ ] Log group specified in Launch Console exists
- [ ] You have permissions to view logs in this log group
- [ ] Check the correct AWS region

**AWS CLI Command:**
```bash
aws logs describe-log-groups --log-group-name-prefix "/launch/edge-functions" --region ap-southeast-1
```

---

### 4. **Verify IAM Permissions**

The AWS credentials used by Launch need these permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "arn:aws:logs:*:*:log-group:/launch/*"
    }
  ]
}
```

---

### 5. **Test Edge Function is Executing**

Make a test request to trigger logging:

```bash
# Desktop request
curl -H "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64)" \
  https://your-deployment-url.com/test

# Mobile request
curl -H "User-Agent: Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)" \
  https://your-deployment-url.com/test
```

The updated edge function now logs structured JSON which should appear in CloudWatch.

---

### 6. **Check Launch Console Deployment Logs**

Look for any errors during deployment:

- [ ] Check deployment logs in Launch Console
- [ ] Look for errors mentioning `test_logTarget`
- [ ] Look for CloudWatch connection errors
- [ ] Check if logging feature is enabled for your organization

---

## 🔧 Common Issues & Solutions

### Issue 1: Log Target Endpoint is Wrong
**Symptom:** Logs not appearing even though edge function runs
**Solution:** 
- If you see `https://launch-grpc-log-target-alb-552904589.ap-southeast-1.elb.amazonaws.com:443` in your log target configuration, this might be an **internal Launch logging endpoint**, NOT CloudWatch
- Change the log target to directly point to CloudWatch

### Issue 2: Project Not Deployed with Latest launch.json
**Symptom:** Old configuration still active
**Solution:**
```bash
# Redeploy the project
# (Use your platform's deployment command)
launch deploy --force
```

### Issue 3: Edge Function Not Actually Running
**Symptom:** No requests hitting the edge function
**Solution:**
- Check if URL path matches: `/test` should hit the rewrite
- Check if proxy route is correctly set up
- Verify the edge function file name: `[proxy].edge.js` should catch all routes

### Issue 4: Wrong AWS Region
**Symptom:** Logs going to wrong region
**Solution:**
- Verify CloudWatch region matches Launch log target region
- Check: `ap-southeast-1` vs `us-east-1` etc.

### Issue 5: Buffering Delay
**Symptom:** Logs appear after 5-10 minutes
**Solution:**
- This is normal for some platforms
- CloudWatch may batch logs before writing
- Wait 5-10 minutes after making requests

---

## 🧪 Testing the Updated Logging

The edge function has been updated with **structured JSON logging**. Each request will now log:

1. **request_start** - When request begins
2. **fetching_api_data** - When calling internal API
3. **api_data_received** - API response received
4. **device_detected** - Mobile/desktop detection
5. **request_complete** - Final response status and duration
6. **api_fetch_error** - If API call fails (ERROR level)

**Expected CloudWatch Log Entry:**
```json
{
  "level": "INFO",
  "requestId": "550e8400-e29b-41d4-a716-446655440000",
  "timestamp": "2025-10-04T10:30:00.000Z",
  "event": "request_start",
  "url": "https://your-site.com/test",
  "method": "GET",
  "userAgent": "Mozilla/5.0 (iPhone...)"
}
```

---

## 📊 CloudWatch Log Insights Queries

Once logs are flowing, use these queries:

### Count requests by device type:
```
fields @timestamp, isMobile, targetHost
| filter event = "device_detected"
| stats count() by isMobile
```

### Track response times:
```
fields @timestamp, duration, status
| filter event = "request_complete"
| stats avg(duration), max(duration), min(duration) by status
```

### Find errors:
```
fields @timestamp, error, stack
| filter level = "ERROR"
| sort @timestamp desc
```

---

## 🔍 Next Steps If Still Not Working

1. **Contact Launch Support** with these details:
   - Project name: `nextjs-edge-redirect`
   - Log target name: `test_logTarget`
   - Deployment ID/URL
   - Screenshot of log target configuration
   - Confirm if CloudWatch integration is enabled for your org

2. **Alternative: Use Launch's Built-in Logging**
   - Check if Launch has its own logging dashboard
   - The endpoint `https://launch-grpc-log-target-alb-...` suggests Launch might have internal logging
   - Check Launch Console for a "Logs" or "Observability" section

3. **Verify Billing/Features**
   - CloudWatch integration might require a specific Launch plan
   - Check if logging features are enabled for your account

---

## 📝 Summary of Changes Made

I've updated `functions/[proxy].edge.js` to include:

1. ✅ Structured JSON logging (easier to parse in CloudWatch)
2. ✅ Request IDs for tracing requests
3. ✅ Timestamps for all events
4. ✅ Log levels (INFO, WARN, ERROR)
5. ✅ Duration tracking
6. ✅ Better error logging with stack traces

**Action Required:**
- Deploy the updated edge function
- Make test requests to trigger logs
- Check CloudWatch after 5-10 minutes

---

## 🆘 Still Need Help?

If logs still don't appear after following all steps:

1. Share your Launch Console log target configuration (screenshot)
2. Confirm your project deployment URL
3. Share any deployment errors from Launch Console
4. Verify if other projects in your org can send logs to CloudWatch
5. Check if `test_logTarget` type should be "CloudWatch" or "gRPC" or something else specific to Launch

