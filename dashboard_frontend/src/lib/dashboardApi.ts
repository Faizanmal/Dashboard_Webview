// Enhanced API service with authentication and new endpoints
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface UserRole {
  id: number;
  user: {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
  };
  role: 'viewer' | 'editor' | 'admin';
  permissions: Record<string, boolean>;
}

export interface Dashboard {
  id: number;
  name: string;
  description: string;
  owner: any;
  is_default: boolean;
  layout_config: any;
  widgets: Widget[];
  widget_count: number;
  created_at: string;
  updated_at: string;
}

export interface Widget {
  id: number;
  dashboard: number;
  widget_type: 'chart' | 'metric' | 'table' | 'gauge' | 'map';
  title: string;
  data_source: string;
  position_x: number;
  position_y: number;
  width: number;
  height: number;
  config: any;
  refresh_interval: number;
  created_at: string;
  updated_at: string;
}

export interface DataSource {
  id: number;
  source_name: string;
  api_key?: string;
  description: string;
  is_active: boolean;
  rate_limit: number;
  last_ingestion: string | null;
  total_requests: number;
  event_count: number;
}

export interface Alert {
  id: number;
  name: string;
  description: string;
  metric_name: string;
  comparison_type: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
  threshold_value: number;
  status: 'active' | 'triggered' | 'resolved' | 'disabled';
  notification_email: string;
  webhook_url: string;
  last_triggered: string | null;
}

export interface ExportJob {
  id: number;
  name: string;
  format: 'csv' | 'excel' | 'pdf' | 'json';
  dashboard: number | null;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  file_path: string;
  error_message: string;
  created_at: string;
  completed_at: string | null;
}

class DashboardApiService {
  private api: AxiosInstance;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor to include auth token
    this.api.interceptors.request.use(
      (config) => {
        if (this.accessToken) {
          config.headers.Authorization = `Bearer ${this.accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Add response interceptor to handle token refresh
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const tokens = await this.refreshAccessToken();
            this.setTokens(tokens);
            originalRequest.headers.Authorization = `Bearer ${tokens.access}`;
            return this.api(originalRequest);
          } catch (refreshError) {
            this.clearTokens();
            // Redirect to login or emit event
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );

    // Load tokens from localStorage
    if (typeof window !== 'undefined') {
      this.accessToken = localStorage.getItem('access_token');
      this.refreshToken = localStorage.getItem('refresh_token');
    }
  }

  // ==================== Authentication ====================

  async login(username: string, password: string): Promise<AuthTokens> {
    const response = await this.api.post<AuthTokens>('/auth/login/', {
      username,
      password,
    });
    this.setTokens(response.data);
    return response.data;
  }

  async refreshAccessToken(): Promise<AuthTokens> {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await this.api.post<{ access: string }>('/auth/refresh/', {
      refresh: this.refreshToken,
    });

    return {
      access: response.data.access,
      refresh: this.refreshToken,
    };
  }

  setTokens(tokens: AuthTokens) {
    this.accessToken = tokens.access;
    this.refreshToken = tokens.refresh;

    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', tokens.access);
      localStorage.setItem('refresh_token', tokens.refresh);
    }
  }

  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;

    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  // ==================== Dashboards ====================

  async getDashboards(params?: { search?: string; page?: number }) {
    const response = await this.api.get<{ results: Dashboard[]; count: number }>('/dashboards/', { params });
    return response.data;
  }

  async getDashboard(id: number) {
    const response = await this.api.get<Dashboard>(`/dashboards/${id}/`);
    return response.data;
  }

  async getDefaultDashboard() {
    const response = await this.api.get<Dashboard>('/dashboards/default/');
    return response.data;
  }

  async createDashboard(data: Partial<Dashboard>) {
    const response = await this.api.post<Dashboard>('/dashboards/', data);
    return response.data;
  }

  async updateDashboard(id: number, data: Partial<Dashboard>) {
    const response = await this.api.put<Dashboard>(`/dashboards/${id}/`, data);
    return response.data;
  }

  async deleteDashboard(id: number) {
    await this.api.delete(`/dashboards/${id}/`);
  }

  async duplicateDashboard(id: number) {
    const response = await this.api.post<Dashboard>(`/dashboards/${id}/duplicate/`);
    return response.data;
  }

  // ==================== Widgets ====================

  async getWidgets(dashboardId?: number) {
    const params = dashboardId ? { dashboard: dashboardId } : {};
    const response = await this.api.get<{ results: Widget[] }>('/widgets/', { params });
    return response.data.results;
  }

  async createWidget(data: Partial<Widget>) {
    const response = await this.api.post<Widget>('/widgets/', data);
    return response.data;
  }

  async updateWidget(id: number, data: Partial<Widget>) {
    const response = await this.api.put<Widget>(`/widgets/${id}/`, data);
    return response.data;
  }

  async deleteWidget(id: number) {
    await this.api.delete(`/widgets/${id}/`);
  }

  async bulkUpdateWidgetPositions(positions: Array<{ id: number; x: number; y: number; width?: number; height?: number }>) {
    const response = await this.api.post('/widgets/bulk_update_positions/', { positions });
    return response.data;
  }

  // ==================== Data Sources ====================

  async getDataSources() {
    const response = await this.api.get<{ results: DataSource[] }>('/data-sources/');
    return response.data.results;
  }

  async createDataSource(data: Partial<DataSource>) {
    const response = await this.api.post<DataSource>('/data-sources/', data);
    return response.data;
  }

  async deleteDataSource(id: number) {
    await this.api.delete(`/data-sources/${id}/`);
  }

  async regenerateApiKey(id: number) {
    const response = await this.api.post<DataSource>(`/data-sources/${id}/regenerate_key/`);
    return response.data;
  }

  // ==================== Metrics ====================

  async getRealtimeMetrics(metricNames: string[], range: '1h' | '6h' | '24h' | '7d' = '1h') {
    const response = await this.api.get('/metrics/realtime/', {
      params: {
        metrics: metricNames.join(','),
        range,
      },
    });
    return response.data;
  }

  async postMetric(data: { metric_name: string; value: number; unit?: string; tags?: Record<string, any> }) {
    const response = await this.api.post('/metrics/post/', data);
    return response.data;
  }

  // ==================== Alerts ====================

  async getAlerts() {
    const response = await this.api.get<{ results: Alert[] }>('/alerts/');
    return response.data.results;
  }

  async getTriggeredAlerts() {
    const response = await this.api.get<Alert[]>('/alerts/triggered/');
    return response.data;
  }

  async createAlert(data: Partial<Alert>) {
    const response = await this.api.post<Alert>('/alerts/', data);
    return response.data;
  }

  async updateAlert(id: number, data: Partial<Alert>) {
    const response = await this.api.put<Alert>(`/alerts/${id}/`, data);
    return response.data;
  }

  async deleteAlert(id: number) {
    await this.api.delete(`/alerts/${id}/`);
  }

  // ==================== Export Jobs ====================

  async getExportJobs() {
    const response = await this.api.get<{ results: ExportJob[] }>('/export-jobs/');
    return response.data.results;
  }

  async createExportJob(data: Partial<ExportJob>) {
    const response = await this.api.post<ExportJob>('/export-jobs/', data);
    return response.data;
  }

  async getExportJob(id: number) {
    const response = await this.api.get<ExportJob>(`/export-jobs/${id}/`);
    return response.data;
  }

  // ==================== WebSocket Connection ====================

  createWebSocket(path: string): WebSocket {
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsHost = process.env.NEXT_PUBLIC_WS_URL || 'localhost:8000';
    const token = this.accessToken;
    return new WebSocket(`${wsProtocol}//${wsHost}/ws/${path}?token=${token}`);
  }

  createDashboardWebSocket(dashboardId: number | string): WebSocket {
    return this.createWebSocket(`dashboard/${dashboardId}/`);
  }

  createMetricsWebSocket(): WebSocket {
    return this.createWebSocket('metrics/');
  }
}

// Export singleton instance
export const dashboardApi = new DashboardApiService();
export default dashboardApi;
