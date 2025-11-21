# Dashboard WebView - Full-Stack Analytics Platform

A modern, full-stack dashboard application with real-time metrics, custom dashboard management, data ingestion API, role-based access control, and export capabilities.

## 🚀 Features Implemented

### ✅ Backend (Django + DRF)

#### 1. **Custom Dashboard Management**
- Create, read, update, delete custom dashboards
- Drag-and-drop widget positioning
- Save multiple dashboard layouts per user
- Default dashboard configuration
- Dashboard duplication

#### 2. **Widget System**
- 5 widget types: Chart, Metric Card, Table, Gauge, Map
- Configurable positioning and sizing
- Custom refresh intervals
- Flexible data source connections
- Bulk position updates for drag-and-drop

#### 3. **Data Ingestion API**
- External API endpoints with API key authentication
- Rate limiting (configurable per data source)
- Event-based data ingestion
- Automatic metric extraction from payloads
- Request tracking and analytics

#### 4. **Real-time Updates**
- WebSocket support via Django Channels
- Live metric streaming
- Dashboard change notifications
- Alert broadcasting
- Metric subscriptions

#### 5. **Role-Based Access Control (RBAC)**
- Three roles: Viewer, Editor, Admin
- Granular permissions system
- Object-level permissions
- Custom permission decorators
- User role management

#### 6. **Export Functionality**
- Export formats: CSV, Excel, PDF, JSON
- Dashboard exports
- Metric data exports
- Custom date range filtering
- Background job processing

#### 7. **Alerts & Monitoring**
- Threshold-based alerts
- Multiple comparison types (>, <, =, >=, <=)
- Email notifications
- Webhook integrations
- Alert status tracking

#### 8. **Audit Logging**
- Complete action tracking
- User activity logs
- Resource change history
- IP address and user agent tracking
- Admin-only access

#### 9. **JWT Authentication**
- Token-based authentication
- Access & refresh tokens
- Token rotation
- Session management

### ✅ Frontend (Next.js + React)

- Modern UI with shadcn/ui components
- Responsive design
- TypeScript support
- React Query for data fetching
- WebSocket integration ready

## 📋 Prerequisites

### Backend
- Python 3.12+
- Django 5.1+
- PostgreSQL or SQLite
- Redis (for WebSocket and caching)

### Frontend
- Node.js 18+
- npm or yarn

## 🛠️ Installation & Setup

### Backend Setup

1. **Navigate to backend directory:**
```bash
cd dashboard_backend
```

2. **Create virtual environment:**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies:**
```bash
pip install -r requirements.txt
```

4. **Create environment file:**
```bash
cat > .env << EOF
SECRET_KEY=your-secret-key-here
DEBUG=True
EOF
```

5. **Run migrations:**
```bash
python manage.py makemigrations
python manage.py migrate
```

6. **Setup initial data:**
```bash
python manage.py setup_initial_data
```

This creates default users:
- **Admin**: `admin` / `admin123`
- **Editor**: `editor` / `editor123`
- **Viewer**: `viewer` / `viewer123`

7. **Start Redis (in separate terminal):**
```bash
redis-server
```

8. **Run the server:**

Option 1 - Standard Django server (HTTP only):
```bash
python manage.py runserver
```

Option 2 - Daphne server (HTTP + WebSocket):
```bash
daphne -b 0.0.0.0 -p 8000 dashboard_backend.asgi:application
```

The API will be available at `http://localhost:8000/api/v1/`

### Frontend Setup

1. **Navigate to frontend directory:**
```bash
cd dashboard_frontend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Create environment file:**
```bash
cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_WS_URL=localhost:8000
EOF
```

4. **Run development server:**
```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

## 📚 API Documentation

### Authentication

**Login:**
```bash
curl -X POST http://localhost:8000/api/v1/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'
```

**Response:**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

### Key Endpoints

#### Dashboards
- `GET /api/v1/dashboards/` - List all dashboards
- `POST /api/v1/dashboards/` - Create dashboard
- `GET /api/v1/dashboards/{id}/` - Get dashboard details
- `PUT /api/v1/dashboards/{id}/` - Update dashboard
- `DELETE /api/v1/dashboards/{id}/` - Delete dashboard
- `POST /api/v1/dashboards/{id}/duplicate/` - Duplicate dashboard
- `GET /api/v1/dashboards/default/` - Get default dashboard

#### Widgets
- `GET /api/v1/widgets/?dashboard={id}` - List widgets
- `POST /api/v1/widgets/` - Create widget
- `PUT /api/v1/widgets/{id}/` - Update widget
- `DELETE /api/v1/widgets/{id}/` - Delete widget
- `POST /api/v1/widgets/bulk_update_positions/` - Update positions

#### Data Ingestion
- `POST /api/v1/data-sources/` - Create data source
- `POST /api/v1/ingest/` - Ingest data (requires X-API-Key header)
- `GET /api/v1/ingestion-events/` - List ingestion events

#### Real-time Metrics
- `GET /api/v1/metrics/realtime/` - Get real-time metrics
- `POST /api/v1/metrics/post/` - Post metric snapshot

#### Export
- `POST /api/v1/export-jobs/` - Create export job
- `GET /api/v1/export-jobs/` - List export jobs
- `GET /api/v1/export-jobs/{id}/` - Get export status

#### Alerts
- `GET /api/v1/alerts/` - List alerts
- `POST /api/v1/alerts/` - Create alert
- `GET /api/v1/alerts/triggered/` - Get triggered alerts

#### Admin Only
- `GET /api/v1/user-roles/` - Manage user roles
- `GET /api/v1/audit-logs/` - View audit logs

For complete API documentation, see: [`dashboard_backend/API_DOCUMENTATION.md`](dashboard_backend/API_DOCUMENTATION.md)

## 🔌 WebSocket Usage

### Dashboard Real-time Updates

```javascript
const token = localStorage.getItem('access_token');
const ws = new WebSocket(`ws://localhost:8000/ws/dashboard/1/?token=${token}`);

ws.onopen = () => {
  console.log('Connected to dashboard');
  
  // Subscribe to metrics
  ws.send(JSON.stringify({
    type: 'subscribe_metrics',
    metrics: ['total_revenue', 'total_users']
  }));
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Received:', data);
  
  if (data.type === 'metric_update') {
    // Update UI with new metric value
    updateMetric(data.metric, data.value);
  }
};
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

## 🧪 Testing the API

### 1. Get Authentication Token
```bash
TOKEN=$(curl -X POST http://localhost:8000/api/v1/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}' \
  | jq -r '.access')
```

### 2. List Dashboards
```bash
curl http://localhost:8000/api/v1/dashboards/ \
  -H "Authorization: Bearer $TOKEN"
```

### 3. Create Data Source
```bash
curl -X POST http://localhost:8000/api/v1/data-sources/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"source_name": "Test App", "description": "Test data source", "rate_limit": 100}'
```

### 4. Ingest Data
```bash
# Use the API key from the previous response
curl -X POST http://localhost:8000/api/v1/ingest/ \
  -H "X-API-Key: ds_xyz..." \
  -H "Content-Type: application/json" \
  -d '{
    "event_type": "user_signup",
    "payload": {
      "user_id": 123,
      "metrics": {
        "total_users": 1500,
        "daily_signups": 50
      }
    }
  }'
```

### 5. Create Export Job
```bash
curl -X POST http://localhost:8000/api/v1/export-jobs/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Monthly Report", "format": "csv", "dashboard": 1}'
```

## 📊 Database Models

### Core Models
- **Dashboard**: Custom dashboard configurations
- **Widget**: Widget definitions and layouts
- **DataIngestion**: Data source configurations
- **IngestionEvent**: Individual data ingestion records
- **MetricSnapshot**: Time-series metric data
- **Alert**: Alert configurations and thresholds
- **ExportJob**: Export job tracking
- **UserRole**: Extended user roles and permissions
- **AuditLog**: Comprehensive activity logging

## 🔐 Security Features

- JWT-based authentication
- Role-based access control (RBAC)
- Object-level permissions
- API key authentication for data ingestion
- Rate limiting on ingestion endpoints
- CORS configuration
- Audit logging for compliance

## 🚦 Project Structure

```
Dashboard_Webview/
├── dashboard_backend/          # Django backend
│   ├── analytics/             # Main app
│   │   ├── models.py         # Database models
│   │   ├── views.py          # API views
│   │   ├── serializers.py    # DRF serializers
│   │   ├── permissions.py    # Custom permissions
│   │   ├── consumers.py      # WebSocket consumers
│   │   ├── routing.py        # WebSocket routing
│   │   └── management/       # Management commands
│   ├── dashboard_backend/     # Project settings
│   ├── requirements.txt
│   ├── setup.sh
│   └── API_DOCUMENTATION.md
├── dashboard_frontend/        # Next.js frontend
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── lib/
│   │   │   ├── api.ts
│   │   │   └── dashboardApi.ts  # New API service
│   │   └── pages/
│   ├── package.json
│   └── ...
└── README.md                  # This file
```

## 🎯 Next Steps / Future Enhancements

- [ ] Implement scheduled reports (Celery integration)
- [ ] Add PDF export generation
- [ ] Multi-tenancy support
- [ ] Advanced dashboard themes
- [ ] Mobile app integration
- [ ] Analytics dashboard UI components
- [ ] Drag-and-drop dashboard builder
- [ ] Chart configuration UI
- [ ] Alert notification UI
- [ ] Export download UI

## 🐛 Troubleshooting

### Redis Connection Error
```bash
# Install Redis
sudo apt-get install redis-server

# Start Redis
redis-server
```

### Port Already in Use
```bash
# Kill process on port 8000
lsof -ti:8000 | xargs kill -9

# Or use a different port
python manage.py runserver 8001
```

### Migration Issues
```bash
# Reset migrations (development only)
python manage.py migrate analytics zero
python manage.py migrate
```

## 📝 License

This project is for educational and development purposes.

## 👥 Default Users

After running `setup_initial_data`, you'll have these users:

| Username | Password | Role | Permissions |
|----------|----------|------|-------------|
| admin | admin123 | Admin | Full access |
| editor | editor123 | Editor | Create/edit dashboards |
| viewer | viewer123 | Viewer | Read-only access |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📧 Support

For questions or issues, please create an issue in the repository.

---

**Built with:** Django 5.1, Django REST Framework, Django Channels, Next.js 14, React 18, TypeScript, shadcn/ui
