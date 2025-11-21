# Quick Start Guide - Dashboard WebView

## 🚀 Quick Setup (5 Minutes)

### 1. Start the Backend

```bash
# Navigate to backend
cd dashboard_backend

# Install dependencies (first time only)
pip install -r requirements.txt

# Run migrations (first time only)
python manage.py migrate

# Setup initial data (first time only)
python manage.py setup_initial_data

# Start server
python manage.py runserver
```

**✅ Backend running at:** `http://localhost:8000`

### 2. Test the API

```bash
# Login and get token
curl -X POST http://localhost:8000/api/v1/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'

# Get dashboards (replace <TOKEN> with access token from above)
curl http://localhost:8000/api/v1/dashboards/ \
  -H "Authorization: Bearer <TOKEN>"
```

### 3. Start the Frontend

```bash
# Navigate to frontend
cd dashboard_frontend

# Install dependencies (first time only)
npm install

# Start dev server
npm run dev
```

**✅ Frontend running at:** `http://localhost:3000`

---

## 👥 Default Credentials

| Username | Password | Role |
|----------|----------|------|
| admin | admin123 | Admin (full access) |
| editor | editor123 | Editor (can create/edit) |
| viewer | viewer123 | Viewer (read-only) |

---

## 📋 Key Features Checklist

### ✅ Implemented Features

- [x] Custom dashboard management (CRUD operations)
- [x] Widget system (5 types: chart, metric, table, gauge, map)
- [x] Drag-and-drop widget positioning
- [x] Data ingestion API with API key auth
- [x] Real-time WebSocket updates
- [x] Role-based access control (Viewer/Editor/Admin)
- [x] CSV/Excel/JSON export functionality
- [x] Alert system with thresholds
- [x] Audit logging
- [x] JWT authentication
- [x] Rate limiting for data ingestion
- [x] Metric snapshots and time-series data

### 🔜 Ready for Frontend Integration

- [ ] Dashboard builder UI
- [ ] Widget configuration UI
- [ ] Data source management UI
- [ ] Alert configuration UI
- [ ] Export download UI
- [ ] Real-time chart updates
- [ ] User role management UI
- [ ] Audit log viewer

---

## 🧪 API Testing Examples

### 1. Authentication

```bash
# Login
curl -X POST http://localhost:8000/api/v1/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'

# Save the token
export TOKEN="your-access-token-here"
```

### 2. Dashboard Operations

```bash
# List dashboards
curl http://localhost:8000/api/v1/dashboards/ \
  -H "Authorization: Bearer $TOKEN"

# Get default dashboard
curl http://localhost:8000/api/v1/dashboards/default/ \
  -H "Authorization: Bearer $TOKEN"

# Create new dashboard
curl -X POST http://localhost:8000/api/v1/dashboards/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Sales Dashboard",
    "description": "Track sales metrics",
    "is_default": false
  }'
```

### 3. Data Ingestion

```bash
# Create data source
curl -X POST http://localhost:8000/api/v1/data-sources/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "source_name": "Mobile App",
    "description": "Mobile app analytics",
    "rate_limit": 1000
  }'

# Save the API key from response
export API_KEY="ds_abc123..."

# Ingest data
curl -X POST http://localhost:8000/api/v1/ingest/ \
  -H "X-API-Key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "event_type": "user_action",
    "payload": {
      "action": "purchase",
      "amount": 99.99,
      "metrics": {
        "total_revenue": 150000,
        "daily_sales": 50
      }
    }
  }'
```

### 4. Real-time Metrics

```bash
# Get real-time metrics
curl "http://localhost:8000/api/v1/metrics/realtime/?metrics=total_revenue,total_users&range=1h" \
  -H "Authorization: Bearer $TOKEN"

# Post metric
curl -X POST http://localhost:8000/api/v1/metrics/post/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "metric_name": "active_users",
    "value": 1250,
    "unit": "users",
    "tags": {"platform": "web"}
  }'
```

### 5. Export Data

```bash
# Create export job
curl -X POST http://localhost:8000/api/v1/export-jobs/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Monthly Revenue Report",
    "format": "csv",
    "dashboard": 1
  }'

# Check export status
curl http://localhost:8000/api/v1/export-jobs/1/ \
  -H "Authorization: Bearer $TOKEN"
```

### 6. Alerts

```bash
# Create alert
curl -X POST http://localhost:8000/api/v1/alerts/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "High Revenue Alert",
    "metric_name": "total_revenue",
    "comparison_type": "gt",
    "threshold_value": 100000,
    "notification_email": "admin@example.com"
  }'

# Get triggered alerts
curl http://localhost:8000/api/v1/alerts/triggered/ \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🔌 WebSocket Examples

### JavaScript/TypeScript

```typescript
import { dashboardApi } from '@/lib/dashboardApi';

// Connect to dashboard WebSocket
const ws = dashboardApi.createDashboardWebSocket(1);

ws.onopen = () => {
  console.log('Connected!');
  
  // Subscribe to metrics
  ws.send(JSON.stringify({
    type: 'subscribe_metrics',
    metrics: ['total_revenue', 'total_users']
  }));
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  
  if (data.type === 'metric_update') {
    console.log(`${data.metric}: ${data.value}`);
    // Update your UI here
  }
};
```

### Python

```python
import asyncio
import websockets
import json

async def subscribe_to_metrics():
    uri = "ws://localhost:8000/ws/dashboard/1/?token=YOUR_TOKEN"
    
    async with websockets.connect(uri) as websocket:
        # Subscribe
        await websocket.send(json.dumps({
            'type': 'subscribe_metrics',
            'metrics': ['total_revenue', 'total_users']
        }))
        
        # Listen for updates
        async for message in websocket:
            data = json.loads(message)
            print(f"Received: {data}")

asyncio.run(subscribe_to_metrics())
```

---

## 📊 Database Schema Overview

```
Users (Django Auth)
  └── UserRole (RBAC)
  
Dashboards
  └── Widgets
  
DataIngestion (API Keys)
  └── IngestionEvents
  
MetricSnapshots (Time-series)
  
Alerts (Monitoring)
  
ExportJobs (Background tasks)
  
AuditLogs (Activity tracking)
```

---

## 🐛 Troubleshooting

### Server won't start
```bash
# Check if port 8000 is in use
lsof -ti:8000 | xargs kill -9

# Try different port
python manage.py runserver 8001
```

### Authentication fails
```bash
# Check if users exist
python manage.py shell
>>> from django.contrib.auth.models import User
>>> User.objects.all()

# Recreate users
python manage.py setup_initial_data
```

### Database errors
```bash
# Reset database (WARNING: deletes all data)
rm db.sqlite3
python manage.py migrate
python manage.py setup_initial_data
```

### WebSocket won't connect
```bash
# Make sure Redis is running
redis-cli ping
# Should return: PONG

# If not installed
sudo apt-get install redis-server
redis-server
```

---

## 📚 Documentation Links

- **Full README**: [`README.md`](../README.md)
- **API Documentation**: [`dashboard_backend/API_DOCUMENTATION.md`](../dashboard_backend/API_DOCUMENTATION.md)
- **Django REST Framework**: https://www.django-rest-framework.org/
- **Django Channels**: https://channels.readthedocs.io/
- **Next.js**: https://nextjs.org/docs

---

## 🎯 Next Steps

1. **Test the API** - Use the examples above
2. **Explore Admin Panel** - `http://localhost:8000/admin/` (admin/admin123)
3. **Build Frontend** - Integrate with the dashboard API service
4. **Add Features** - Check the roadmap in main README
5. **Deploy** - Follow Django deployment best practices

---

**Need help?** Check the main README or create an issue!
