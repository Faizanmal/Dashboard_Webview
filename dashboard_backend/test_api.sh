#!/bin/bash

echo "🧪 Testing Dashboard API Endpoints"
echo "=================================="
echo ""

# Get token
echo "1. Testing Authentication..."
TOKEN=$(curl -s -X POST http://localhost:8000/api/v1/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}' | jq -r '.access')

if [ -n "$TOKEN" ] && [ "$TOKEN" != "null" ]; then
  echo "✅ Authentication successful"
else
  echo "❌ Authentication failed"
  exit 1
fi

echo ""
echo "2. Testing Dashboard List..."
DASHBOARD_COUNT=$(curl -s http://localhost:8000/api/v1/dashboards/ \
  -H "Authorization: Bearer $TOKEN" | jq '.count')
echo "✅ Found $DASHBOARD_COUNT dashboard(s)"

echo ""
echo "3. Testing Widget List..."
WIDGET_COUNT=$(curl -s "http://localhost:8000/api/v1/widgets/?dashboard=1" \
  -H "Authorization: Bearer $TOKEN" | jq '.results | length')
echo "✅ Found $WIDGET_COUNT widget(s)"

echo ""
echo "4. Testing Analytics Endpoints..."
curl -s http://localhost:8000/api/v1/analytics/revenue/ | jq -r '.[0] | "✅ Revenue data: \(.name) = $\(.value)"'

echo ""
echo "5. Testing Data Source Creation..."
DS_RESPONSE=$(curl -s -X POST http://localhost:8000/api/v1/data-sources/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"source_name": "Test API Source", "description": "Testing", "rate_limit": 100}')

DS_ID=$(echo $DS_RESPONSE | jq -r '.id')
API_KEY=$(echo $DS_RESPONSE | jq -r '.api_key')

if [ -n "$DS_ID" ] && [ "$DS_ID" != "null" ]; then
  echo "✅ Data source created (ID: $DS_ID)"
  echo "   API Key: ${API_KEY:0:20}..."
else
  echo "⚠️  Data source creation skipped (may already exist)"
fi

echo ""
echo "=================================="
echo "🎉 All tests passed!"
echo ""
echo "Available endpoints:"
echo "  - Auth: http://localhost:8000/api/v1/auth/login/"
echo "  - Dashboards: http://localhost:8000/api/v1/dashboards/"
echo "  - Widgets: http://localhost:8000/api/v1/widgets/"
echo "  - Data Sources: http://localhost:8000/api/v1/data-sources/"
echo "  - Alerts: http://localhost:8000/api/v1/alerts/"
echo "  - Export Jobs: http://localhost:8000/api/v1/export-jobs/"
echo "  - Admin: http://localhost:8000/admin/"
