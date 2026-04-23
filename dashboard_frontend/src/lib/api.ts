const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

// console.log('API_BASE_URL', API_BASE_URL);

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface RevenueDataPoint {
  name: string;
  value: number;
}

export interface ChannelPerformance {
  name: string;
  value: number;
  comparison: number;
}

export interface AudienceSegment {
  name: string;
  value: number;
  color: string;
}

export interface Campaign {
  id: string;
  client: string;
  campaign: string;
  revenue: number;
  impressions: number;
  clicks: number;
  conversions: number;
  status: 'active' | 'paused' | 'completed';
}

export interface MetricsData {
  totalRevenue: {
    value: string;
    change: number;
    changeType: 'increase' | 'decrease';
  };
  totalUsers: {
    value: string;
    change: number;
    changeType: 'increase' | 'decrease';
  };
  conversions: {
    value: string;
    change: number;
    changeType: 'increase' | 'decrease';
  };
  growthRate: {
    value: string;
    change: number;
    changeType: 'increase' | 'decrease';
  };
}

class ApiService {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        // Add authentication header if needed
        // 'Authorization': `Bearer ${getAuthToken()}`,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('API request error:', error);
      throw error;
    }
  }

  // Revenue data
  async getRevenueData(): Promise<RevenueDataPoint[]> {
    return this.request<RevenueDataPoint[]>('/analytics/revenue');
  }

  // Channel performance
  async getChannelPerformance(): Promise<ChannelPerformance[]> {
    return this.request<ChannelPerformance[]>('/analytics/channels');
  }

  // Audience segments
  async getAudienceSegments(): Promise<AudienceSegment[]> {
    return this.request<AudienceSegment[]>('/analytics/audience');
  }

  // Campaign data
  async getCampaigns(): Promise<Campaign[]> {
    return this.request<Campaign[]>('/campaigns');
  }

  // Metrics data
  async getMetrics(): Promise<MetricsData> {
    return this.request<MetricsData>('/analytics/metrics');
  }

  // Get all dashboard data at once
  async getDashboardData() {
    const [revenue, channels, audience, campaigns, metrics] = await Promise.all([
      this.getRevenueData(),
      this.getChannelPerformance(),
      this.getAudienceSegments(),
      this.getCampaigns(),
      this.getMetrics(),
    ]);

    return {
      revenueData: revenue,
      channelPerformance: channels,
      audienceSegments: audience,
      campaignData: campaigns,
      metricsData: metrics,
    };
  }
}

export const apiService = new ApiService(); 