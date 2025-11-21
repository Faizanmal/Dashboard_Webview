# Frontend Integration Guide

## Overview
The frontend has been updated to integrate with all backend features including authentication, real-time updates, data sources, alerts, and exports.

## Installation

1. Install dependencies:
```bash
cd dashboard_frontend
npm install
```

2. Update environment variables (create `.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000
```

3. Start the development server:
```bash
npm run dev
```

## Features Implemented

### 1. Authentication System
- **Login Page**: `/app/login/page.tsx`
- **Auth Hook**: `useAuth()` in `/hooks/useAuth.ts`
- **Auth Store**: Zustand store with persistence in `/stores/authStore.ts`
- **Protected Routes**: `ProtectedRoute` component wraps authenticated pages

**Usage:**
```tsx
import { useAuth } from '@/hooks/useAuth';

const { login, logout, isAuthenticated, user, userRole } = useAuth();
```

### 2. Dashboard Management
- **Dashboard Page**: `/app/dashboard/page.tsx`
- **Dashboard Hooks**: `useDashboards()`, `useCreateDashboard()`, etc.
- **Dashboard Dialog**: Create/edit dashboards with `DashboardDialog` component

**Usage:**
```tsx
import { useDashboards, useCreateDashboard } from '@/hooks/useDashboard';

const { data: dashboards } = useDashboards();
const createMutation = useCreateDashboard();
```

### 3. Real-time Widgets
- **RealtimeWidget Component**: Displays live updating metrics
- **WebSocket Hook**: `useDashboardWebSocket()` for real-time connections
- **Metrics Hook**: `useRealtimeMetrics()` for fetching historical data

**Widget Types Supported:**
- `metric_card`: Display single metric with trend
- `line_chart`: Time-series line chart
- `area_chart`: Time-series area chart
- `bar_chart`: Bar chart visualization
- `pie_chart`: Pie chart visualization

**Usage:**
```tsx
import { RealtimeWidget } from '@/components/Dashboard/RealtimeWidget';

<RealtimeWidget
  widgetId={1}
  widgetType="metric_card"
  title="Total Revenue"
  metricName="total_revenue"
  dashboardId={1}
  refreshInterval={5000}
/>
```

### 4. Data Source Management
- **DataSourceManager Component**: Full CRUD for data sources
- **API Key Management**: View, copy, and regenerate API keys
- **Rate Limiting**: Configure request limits per source

**Usage:**
```tsx
import { DataSourceManager } from '@/components/Dashboard/DataSourceManager';

<DataSourceManager />
```

### 5. Alert Configuration
- **AlertManager Component**: Create and manage threshold-based alerts
- **Triggered Alerts**: Real-time notification banner
- **Alert Types**: gt, gte, lt, lte, eq comparisons

**Usage:**
```tsx
import { AlertManager } from '@/components/Dashboard/AlertManager';

<AlertManager />
```

### 6. Export Jobs
- **ExportManager Component**: Create and track export jobs
- **Format Support**: CSV, Excel, JSON, PDF
- **Real-time Status**: Automatic polling for job completion

**Usage:**
```tsx
import { ExportManager } from '@/components/Dashboard/ExportManager';

<ExportManager />
```

## State Management

### Auth Store (Zustand)
```tsx
interface AuthState {
  user: User | null;
  userRole: UserRole | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  hasPermission: (permission: string) => boolean;
  isAdmin: () => boolean;
  isEditor: () => boolean;
}
```

### Dashboard Store (Zustand)
```tsx
interface DashboardState {
  currentDashboard: Dashboard | null;
  dashboards: Dashboard[];
  widgets: Widget[];
  isLoading: boolean;
  error: string | null;
}
```

## API Hooks

### Dashboard Hooks
- `useDashboards()` - Fetch all dashboards
- `useDashboard(id)` - Fetch single dashboard
- `useDefaultDashboard()` - Fetch default dashboard
- `useCreateDashboard()` - Create new dashboard
- `useUpdateDashboard()` - Update dashboard
- `useDeleteDashboard()` - Delete dashboard
- `useDuplicateDashboard()` - Duplicate dashboard

### Widget Hooks
- `useWidgets(dashboardId)` - Fetch widgets
- `useCreateWidget()` - Create widget
- `useUpdateWidget()` - Update widget
- `useDeleteWidget()` - Delete widget
- `useBulkUpdateWidgetPositions()` - Update widget positions

### Data Source Hooks
- `useDataSources()` - Fetch all data sources
- `useCreateDataSource()` - Create data source
- `useDeleteDataSource()` - Delete data source
- `useRegenerateApiKey()` - Regenerate API key

### Alert Hooks
- `useAlerts()` - Fetch all alerts
- `useTriggeredAlerts()` - Fetch triggered alerts (auto-refresh)
- `useCreateAlert()` - Create alert
- `useUpdateAlert()` - Update alert
- `useDeleteAlert()` - Delete alert

### Export Hooks
- `useExportJobs()` - Fetch all export jobs
- `useCreateExportJob()` - Create export job
- `useExportJob(id)` - Fetch single job with auto-refresh

### WebSocket Hooks
- `useDashboardWebSocket(dashboardId)` - Connect to dashboard WebSocket
- `useMetricsWebSocket()` - Connect to metrics stream

## Role-Based Access Control (RBAC)

The frontend respects backend RBAC:

- **Viewer**: Can view dashboards and widgets
- **Editor**: Can create/edit dashboards, widgets, data sources, and alerts
- **Admin**: Full access to all features

**Check permissions:**
```tsx
const { hasPermission, isAdmin, isEditor } = useAuthStore();

if (isEditor) {
  // Show editor features
}

if (hasPermission('can_export')) {
  // Show export button
}
```

## WebSocket Real-time Updates

### Dashboard WebSocket
```tsx
const { isConnected, lastMessage, subscribeToMetrics } = useDashboardWebSocket(dashboardId);

useEffect(() => {
  if (isConnected) {
    subscribeToMetrics(['total_revenue', 'active_users']);
  }
}, [isConnected]);

useEffect(() => {
  if (lastMessage?.type === 'metric_update') {
    console.log('New value:', lastMessage.value);
  }
}, [lastMessage]);
```

### Metrics WebSocket
```tsx
const { isConnected, metrics, requestMetrics } = useMetricsWebSocket();

// metrics is a Record<string, { value: number, timestamp: string }>
```

## API Service

The `dashboardApi` service in `/lib/dashboardApi.ts` provides:
- Automatic JWT token refresh
- Request/response interceptors
- WebSocket connection helpers
- Type-safe API methods

## Component Structure

```
src/
├── app/
│   ├── login/page.tsx          # Login page
│   └── dashboard/
│       ├── page.tsx            # Main dashboard page
│       └── layout.tsx          # Dashboard layout
├── components/
│   ├── ProtectedRoute.tsx      # Auth wrapper
│   ├── Dashboard/
│   │   ├── RealtimeWidget.tsx  # Live widget component
│   │   ├── DashboardDialog.tsx # Dashboard CRUD
│   │   ├── DataSourceManager.tsx
│   │   ├── AlertManager.tsx
│   │   └── ExportManager.tsx
│   └── ui/                     # shadcn/ui components
├── hooks/
│   ├── useAuth.ts              # Authentication
│   ├── useDashboard.ts         # Dashboard operations
│   ├── useApi.ts               # Data sources, alerts, exports
│   └── useWebSocket.ts         # WebSocket connections
├── stores/
│   ├── authStore.ts            # Auth state management
│   └── dashboardStore.ts       # Dashboard state
└── lib/
    └── dashboardApi.ts         # API service (450+ lines)
```

## Next Steps

1. **Install dependencies**: `npm install`
2. **Configure environment**: Create `.env.local` with API URLs
3. **Start development**: `npm run dev`
4. **Login**: Use demo credentials from the backend
5. **Customize**: Add more widget types, dashboard layouts, etc.

## Demo Credentials

```
Admin:  admin / admin123
Editor: editor / editor123
Viewer: viewer / viewer123
```

## Additional Features to Implement

1. **Drag-and-drop widget positioning** using react-grid-layout
2. **Widget configuration panel** for customizing data sources
3. **Dashboard templates** for quick setup
4. **Advanced charts** with more visualization options
5. **Mobile responsive layout** improvements
6. **Dark/light theme toggle** (already supported by shadcn/ui)
7. **User profile management**
8. **Audit log viewer** for admins

All backend features are now accessible through the frontend!
