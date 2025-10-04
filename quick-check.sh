#!/bin/bash

echo "==================================="
echo "CloudWatch Logging Quick Diagnostics"
echo "==================================="
echo ""

# Set your AWS region
REGION="ap-southeast-1"
LOG_GROUP="/ecs/otel"

echo "1. Checking if CloudWatch log group exists..."
aws logs describe-log-groups \
  --log-group-name-prefix "$LOG_GROUP" \
  --region "$REGION" 2>&1

echo ""
echo "-----------------------------------"
echo ""

echo "2. Checking recent log streams..."
aws logs describe-log-streams \
  --log-group-name "$LOG_GROUP" \
  --order-by LastEventTime \
  --descending \
  --max-items 5 \
  --region "$REGION" 2>&1

echo ""
echo "-----------------------------------"
echo ""

echo "3. Tailing recent logs (last 5 minutes)..."
aws logs tail "$LOG_GROUP" \
  --since 5m \
  --region "$REGION" 2>&1

echo ""
echo "==================================="
echo "Diagnostic Complete!"
echo ""
echo "Next steps:"
echo "- If log group doesn't exist, create it:"
echo "  aws logs create-log-group --log-group-name '$LOG_GROUP' --region $REGION"
echo ""
echo "- If no logs appear, check:"
echo "  1. OTEL Collector is running"
echo "  2. Bearer token matches in Launch Console"
echo "  3. Project is deployed with launch.json"
echo "  4. You've made test requests to your site"
echo "==================================="

