# Dashboard Backend API Documentation

## Overview
This API provides comprehensive dashboard management, real-time metrics, data ingestion, export capabilities, and role-based access control.

**Base URL:** `http://localhost:8000/api/v1/`

## Authentication

### JWT Authentication
All protected endpoints require JWT authentication via Bearer token.

#### Login (Get JWT Token)
```http
POST /api/v1/auth/login/
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

**Response:**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

#### Refresh Token
```http
POST /api/v1/auth/refresh/
Content-Type: application/json

{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

#### Using the Token
Include in all authenticated requests:
```http
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...
```

## Endpoints

### 1. Dashboard Management

#### List Dashboards
```http
GET /api/v1/dashboards/
Authorization: Bearer <token>
```

#### Get Dashboard
```http
GET /api/v1/dashboards/{id}/
Authorization: Bearer <token>
```

#### Create Dashboard
```http
POST /api/v1/dashboards/
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "My Dashboard",
  "description": "Custom analytics dashboard",
  "is_default": false,
  "layout_config": {
    "grid": {"cols": 12, "rows": "auto"}
  }
}
```

#### Update Dashboard
```http
PUT /api/v1/dashboards/{id}/
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Dashboard Name",
  "description": "Updated description"
}
```

#### Delete Dashboard
```http
DELETE /api/v1/dashboards/{id}/
Authorization: Bearer <token>
```

#### Duplicate Dashboard
```http
POST /api/v1/dashboards/{id}/duplicate/
Authorization: Bearer <token>
```

#### Get Default Dashboard
```http
GET /api/v1/dashboards/default/
Authorization: Bearer <token>
```

### 2. Widget Management

#### List Widgets
```http
GET /api/v1/widgets/?dashboard={dashboard_id}
Authorization: Bearer <token>
```

#### Create Widget
```http
POST /api/v1/widgets/
Authorization: Bearer <token>
Content-Type: application/json

{
  "dashboard": 1,
  "widget_type": "chart",
  "title": "Revenue Chart",
  "data_source": "/api/v1/analytics/revenue/",
  "position_x": 0,
  "position_y": 0,
  "width": 6,
  "height": 4,
  "config": {
    "chart_type": "line",
    "color": "#8884d8"
  },
  "refresh_interval": 60
}
```

#### Bulk Update Widget Positions
```http
POST /api/v1/widgets/bulk_update_positions/
Authorization: Bearer <token>
Content-Type: application/json

{
  "positions": [
    {"id": 1, "x": 0, "y": 0, "width": 6, "height": 4},
    {"id": 2, "x": 6, "y": 0, "width": 6, "height": 4}
  ]
}
```

### 3. Data Ingestion API

#### Create Data Source
```http
POST /api/v1/data-sources/
Authorization: Bearer <token>
Content-Type: application/json

{
  "source_name": "My External App",
  "description": "Data from external application",
  "is_active": true,
  "rate_limit": 100
}
```

**Response includes generated API key:**
```json
{
  "id": 1,
  "source_name": "My External App",
  "api_key": "ds_xyz123...",
  "rate_limit": 100,
  ...
}
```

#### Ingest Data (External API)
```http
POST /api/v1/ingest/
X-API-Key: ds_xyz123...
Content-Type: application/json

{
  "event_type": "user_signup",
  "payload": {
    "user_id": 12345,
    "email": "user@example.com",
    "metrics": {
      "total_users": 1500,
      "daily_signups": 50
    }
  },
  "metadata": {
    "source": "web",
    "version": "1.0"
  }
}
```

#### List Ingestion Events
```http
GET /api/v1/ingestion-events/?data_source={id}
Authorization: Bearer <token>
```

### 4. Real-time Metrics

#### Get Real-time Metrics
```http
GET /api/v1/metrics/realtime/?metrics=total_revenue,total_users&range=1h
Authorization: Bearer <token>
```

**Query Parameters:**
- `metrics`: Comma-separated list of metric names
- `range`: Time range (`1h`, `6h`, `24h`, `7d`)

#### Post Metric Snapshot
```http
POST /api/v1/metrics/post/
Authorization: Bearer <token>
Content-Type: application/json

{
  "metric_name": "total_revenue",
  "value": 125000.50,
  "unit": "USD",
  "tags": {
    "region": "US",
    "product": "premium"
  }
}
```

### 5. Export Functionality

#### Create Export Job
```http
POST /api/v1/export-jobs/
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Monthly Revenue Report",
  "format": "csv",
  "dashboard": 1,
  "filters": {
    "metric_names": ["revenue", "users"],
    "start_date": "2025-11-01"
  }
}
```

**Supported formats:** `csv`, `excel`, `pdf`, `json`

#### List Export Jobs
```http
GET /api/v1/export-jobs/
Authorization: Bearer <token>
```

#### Get Export Job Status
```http
GET /api/v1/export-jobs/{id}/
Authorization: Bearer <token>
```

### 6. Alerts

#### Create Alert
```http
POST /api/v1/alerts/
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "High Revenue Alert",
  "description": "Alert when revenue exceeds threshold",
  "metric_name": "total_revenue",
  "comparison_type": "gt",
  "threshold_value": 100000,
  "notification_email": "admin@example.com",
  "webhook_url": "https://hooks.slack.com/..."
}
```

**Comparison types:** `gt`, `lt`, `eq`, `gte`, `lte`

#### List Alerts
```http
GET /api/v1/alerts/
Authorization: Bearer <token>
```

#### Get Triggered Alerts
```http
GET /api/v1/alerts/triggered/
Authorization: Bearer <token>
```

### 7. User Roles (Admin Only)

#### List User Roles
```http
GET /api/v1/user-roles/
Authorization: Bearer <admin-token>
```

#### Update User Role
```http
PUT /api/v1/user-roles/{id}/
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "role": "editor",
  "permissions": {
    "can_export": true,
    "can_import": false
  }
}
```

### 8. Audit Logs (Admin Only)

#### List Audit Logs
```http
GET /api/v1/audit-logs/?user={username}&resource_type=Dashboard
Authorization: Bearer <admin-token>
```

## WebSocket Connections

### Dashboard Real-time Updates
```javascript
const token = 'your-jwt-token';
const ws = new WebSocket(`ws://localhost:8000/ws/dashboard/1/?token=${token}`);

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Received:', data);
};

// Subscribe to specific metrics
ws.send(JSON.stringify({
  type: 'subscribe_metrics',
  metrics: ['total_revenue', 'total_users']
}));
```

### Metrics Stream
```javascript
const ws = new WebSocket(`ws://localhost:8000/ws/metrics/?token=${token}`);

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.type === 'metric_update') {
    console.log(`${data.metric_name}: ${data.value}`);
  }
};
```

## User Roles & Permissions

### Role Hierarchy
1. **Viewer**: Read-only access to dashboards and data
2. **Editor**: Can create/edit dashboards and widgets
3. **Admin**: Full access including user management

### Default Users
- `admin` / `admin123` (Admin)
- `editor` / `editor123` (Editor)
- `viewer` / `viewer123` (Viewer)

## Rate Limiting

- Data ingestion endpoints: Configurable per data source (default: 100 requests/hour)
- API endpoints: No rate limiting (add if needed)

## Error Responses

### 400 Bad Request
```json
{
  "error": "Invalid data",
  "details": {
    "field": ["Error message"]
  }
}
```

### 401 Unauthorized
```json
{
  "detail": "Authentication credentials were not provided."
}
```

### 403 Forbidden
```json
{
  "detail": "You do not have permission to perform this action."
}
```

### 429 Rate Limit Exceeded
```json
{
  "error": "Rate limit exceeded",
  "limit": 100,
  "period": "1 hour"
}
```

## Setup Instructions

### 1. Install Dependencies
```bash
cd dashboard_backend
pip install -r requirements.txt
```

### 2. Run Migrations
```bash
python manage.py makemigrations
python manage.py migrate
```

### 3. Setup Initial Data
```bash
python manage.py setup_initial_data
```

### 4. Start Redis (for real-time features)
```bash
redis-server
```

### 5. Run Development Server
```bash
# Option 1: Standard Django server (HTTP only)
python manage.py runserver

# Option 2: Daphne server (HTTP + WebSocket)
daphne -b 0.0.0.0 -p 8000 dashboard_backend.asgi:application
```

## Testing the API

Use the provided test users or create your own:

```bash
# Test authentication
curl -X POST http://localhost:8000/api/v1/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'

# Test dashboard list
curl http://localhost:8000/api/v1/dashboards/ \
  -H "Authorization: Bearer <your-token>"
```
