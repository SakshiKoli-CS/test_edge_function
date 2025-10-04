#!/bin/bash

# Your deployment URL
DEPLOYMENT_URL="testedgefunction.devcontentstackapps.com"

echo "Making test requests to generate logs..."
echo "=================================="
echo ""

echo "1. Desktop request (should route to desktop host)..."
curl -i "https://${DEPLOYMENT_URL}/test" \
  -H "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"

echo ""
echo "-----------------------------------"
echo ""

echo "2. Mobile request (should route to mobile host)..."
curl -i "https://${DEPLOYMENT_URL}/test" \
  -H "User-Agent: Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15"

echo ""
echo "-----------------------------------"
echo ""

echo "3. Making 5 more requests..."
for i in {1..5}; do
  echo "Request $i..."
  curl -s "https://${DEPLOYMENT_URL}/test" > /dev/null
  sleep 1
done

echo ""
echo "=================================="
echo "Test requests complete!"
echo ""
echo "Next steps:"
echo "1. Wait 2-5 minutes for logs to appear"
echo "2. Check CloudWatch log group: /ecs/otel"
echo "3. Look for log stream: test_logTarget/logs"
echo "4. Or ask your DevOps team to check CloudWatch"
echo "=================================="

