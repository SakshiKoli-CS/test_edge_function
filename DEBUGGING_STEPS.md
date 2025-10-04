# CloudWatch Logging Debug Steps

## Your Current Setup

### OTEL Collector Configuration
- **Endpoint**: `0.0.0.0:4317` (gRPC)
- **Authentication**: Bearer token (`temp-token123`)
- **AWS Region**: `ap-southeast-1`
- **CloudWatch Log Group**: `/ecs/otel`
- **CloudWatch Log Stream**: `test_logTarget/logs`
- **Log Retention**: 30 days

### Launch Configuration
- **launch.json**: References `test_logTarget`
- **Edge Function**: Has console.log statements
- **Project**: nextjs-edge-redirect

---

## Step-by-Step Debugging

### Step 1: Verify CloudWatch Log Group Exists

Run this AWS CLI command:

```bash
aws logs describe-log-groups \
  --log-group-name-prefix "/ecs/otel" \
  --region ap-southeast-1
```

**Expected Output:**
```json
{
  "logGroups": [
    {
      "logGroupName": "/ecs/otel",
      "creationTime": 1234567890,
      "retentionInDays": 30,
      "storedBytes": 1234,
      "arn": "arn:aws:logs:ap-southeast-1:..."
    }
  ]
}
```

**If log group doesn't exist**, create it:
```bash
aws logs create-log-group \
  --log-group-name "/ecs/otel" \
  --region ap-southeast-1
```

---

### Step 2: Check Launch Console Log Target Configuration

1. Go to **Launch Console** → **Settings** → **Log Targets**
2. Find `test_logTarget`
3. Verify these EXACT values:
   - **Log Target Name**: `test_logTarget`
   - **Endpoint URL**: `https://YOUR-OTEL-COLLECTOR-URL:4317` (or the ALB URL)
   - **Authorization Type**: Bearer Token
   - **Token**: `temp-token123` (must match OTEL Collector config)

**IMPORTANT**: The endpoint URL should point to where your OTEL Collector is hosted (the ALB you mentioned earlier).

---

### Step 3: Verify OTEL Collector is Running

Check if your OTEL Collector service is running:

```bash
# If deployed on ECS
aws ecs list-tasks --cluster YOUR_CLUSTER_NAME --region ap-southeast-1

# Check service status
aws ecs describe-services --cluster YOUR_CLUSTER_NAME --services otel-collector --region ap-southeast-1

# Check CloudWatch logs for the OTEL Collector itself
aws logs tail /ecs/otel-collector --follow --region ap-southeast-1
```

**Look for errors like:**
- Authentication failures
- CloudWatch permission errors
- Connection issues

---

### Step 4: Verify IAM Permissions

The OTEL Collector needs these IAM permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents",
        "logs:DescribeLogGroups",
        "logs:DescribeLogStreams"
      ],
      "Resource": [
        "arn:aws:logs:ap-southeast-1:*:log-group:/ecs/otel",
        "arn:aws:logs:ap-southeast-1:*:log-group:/ecs/otel:*"
      ]
    }
  ]
}
```

**Check the IAM role attached to your OTEL Collector ECS task.**

---

### Step 5: Test OTEL Collector Directly

Test if the OTEL Collector is receiving and processing logs:

1. **Check OTEL Collector logs** (if you have debug exporter enabled):
```bash
# Replace with your OTEL Collector log group
aws logs tail /aws/ecs/otel-collector --follow --region ap-southeast-1
```

Look for:
- ✅ "Received logs from Launch"
- ✅ "Exported logs to CloudWatch"
- ❌ Authentication errors
- ❌ CloudWatch export errors

2. **Send a test log** to verify OTEL Collector works:
```bash
# Install grpcurl if needed
brew install grpcurl

# Send test log (adjust endpoint URL)
grpcurl -d '{"resource_logs":[{"scope_logs":[{"log_records":[{"body":{"string_value":"test log"},"time_unix_nano":"'$(date +%s%N)'"}]}]}]}' \
  -H "Authorization: Bearer temp-token123" \
  YOUR-OTEL-COLLECTOR-URL:4317 \
  opentelemetry.proto.collector.logs.v1.LogsService/Export
```

---

### Step 6: Verify Launch Project Deployment

1. **Check deployment status**:
   - Go to Launch Console
   - Check your project's latest deployment
   - Look for any warnings about logging configuration

2. **Redeploy if needed**:
   - The `launch.json` logging configuration only applies after deployment
   - Make sure latest deployment has `launch.json` with logging config

3. **Check deployment logs**:
   - Look for messages like "Logging configured with target: test_logTarget"
   - Check for any errors about log target not found

---

### Step 7: Make Test Requests

Generate some logs by making requests to your deployed site:

```bash
# Desktop request
curl -v https://YOUR-DEPLOYMENT-URL.com/test \
  -H "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64)"

# Mobile request  
curl -v https://YOUR-DEPLOYMENT-URL.com/test \
  -H "User-Agent: Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)"

# Make multiple requests
for i in {1..10}; do
  curl https://YOUR-DEPLOYMENT-URL.com/test
  sleep 1
done
```

---

### Step 8: Check CloudWatch Logs

Wait 2-5 minutes after making requests, then check CloudWatch:

```bash
# List log streams in the log group
aws logs describe-log-streams \
  --log-group-name "/ecs/otel" \
  --order-by LastEventTime \
  --descending \
  --region ap-southeast-1

# Tail the logs
aws logs tail /ecs/otel --follow --region ap-southeast-1

# Filter for your log stream
aws logs tail /ecs/otel/test_logTarget/logs --follow --region ap-southeast-1
```

**What to look for:**
- `Fetching data from API: ...`
- `API data received: ...`
- `response status 200`

---

## Common Issues & Solutions

### Issue 1: Token Mismatch
**Symptom**: No logs appearing, OTEL Collector shows auth errors
**Solution**: 
- Verify bearer token in Launch Console matches OTEL Collector config
- Token in Launch Log Target: `temp-token123`
- Token in OTEL config: `temp-token123`
- They must match EXACTLY

### Issue 2: Wrong Endpoint URL
**Symptom**: Launch can't connect to OTEL Collector
**Solution**:
- Launch Log Target endpoint should be the PUBLIC URL of your OTEL Collector
- Example: `https://launch-grpc-log-target-alb-552904589.ap-southeast-1.elb.amazonaws.com:443`
- NOT `0.0.0.0:4317` (that's the internal listening address)

### Issue 3: CloudWatch Permissions
**Symptom**: OTEL Collector receives logs but can't write to CloudWatch
**Solution**:
- Check OTEL Collector ECS task IAM role
- Add CloudWatch Logs write permissions
- Check CloudFormation/Terraform that deploys OTEL Collector

### Issue 4: Log Group Auto-Creation Disabled
**Symptom**: Logs not appearing, OTEL logs show "log group doesn't exist"
**Solution**:
- Manually create the log group: `/ecs/otel`
- Or update OTEL Collector IAM to allow `logs:CreateLogGroup`

### Issue 5: Deployment Not Applied
**Symptom**: Old deployment without launch.json still running
**Solution**:
- Trigger a new deployment in Launch Console
- Verify in deployment logs that logging config is applied

### Issue 6: Network/Security Group Issues
**Symptom**: Launch can't reach OTEL Collector
**Solution**:
- Check ALB security groups allow incoming traffic on port 443/4317
- Check if ALB is public or internal
- Verify DNS resolves correctly
- Test: `curl -v https://YOUR-OTEL-ALB:443`

---

## Quick Wins to Try First

1. **Check if log group exists**: `aws logs describe-log-groups --log-group-name-prefix "/ecs/otel" --region ap-southeast-1`
2. **Verify Launch Log Target token matches**: Check Launch Console vs OTEL config
3. **Redeploy your project**: Ensure launch.json is applied
4. **Check OTEL Collector is running**: It must be up to receive logs
5. **Make test requests**: Generate logs by hitting your site
6. **Wait 5 minutes**: CloudWatch may have slight delay

---

## Expected Log Format in CloudWatch

Once working, you should see logs like:

```
Fetching data from API: https://your-site.com/api/data
API data received: {"message":"Data from API route","timestamp":"2025-10-04T...","hosts":{"mobile":"demo-site-edge.gcpcontentstackapps.com","desktop":"testedgefunction.gcpcontentstackapps.com"},"config":{"redirectEnabled":true,"cacheTime":300}}
response status 200
```

---

## Still Not Working?

If you've tried everything above and logs still don't appear:

1. **Check OTEL Collector's own logs** for errors
2. **Contact Launch Support** with:
   - Project name
   - Log target name
   - Deployment ID
   - Timestamp of test requests
3. **Verify billing/plan**: Ensure logging feature is enabled for your org
4. **Try debug exporter first**: Change OTEL config to use `debug` exporter to verify logs are reaching collector

---

## Next Steps

Run through Steps 1-8 in order and note where it fails. That will pinpoint the exact issue.

Most likely culprits (in order):
1. ⚠️ OTEL Collector not running or crashed
2. ⚠️ Bearer token mismatch between Launch and OTEL config
3. ⚠️ CloudWatch log group doesn't exist
4. ⚠️ IAM permissions missing for OTEL Collector
5. ⚠️ Project not redeployed with launch.json

