import { apiService } from './api';
import { mockApiService } from './mockApiService';
import type {
  RevenueDataPoint,
  ChannelPerformance,
  AudienceSegment,
  Campaign,
  MetricsData,
} from './api';

class EnhancedApiService {
  private useMockData = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';
  private async tryRealApi<T>(apiCall: () => Promise<T>): Promise<T> {
    try {
      return await apiCall();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn('Real API failed, falling back to mock data:', error);
      throw error;
    }
  }

  private async getDataWithFallback<T>(
    realApiCall: () => Promise<T>,
    mockApiCall: () => Promise<T>
  ): Promise<T> {
    if (this.useMockData) {
      return mockApiCall();
    }

    try {
      return await this.tryRealApi(realApiCall);
    } catch {
      // eslint-disable-next-line no-console
      console.warn('Falling back to mock data due to API error');
      return mockApiCall();
    }
  }

  async getRevenueData(): Promise<RevenueDataPoint[]> {
    return this.getDataWithFallback(
      () => apiService.getRevenueData(),
      () => mockApiService.getRevenueData()
    );
  }

  async getChannelPerformance(): Promise<ChannelPerformance[]> {
    return this.getDataWithFallback(
      () => apiService.getChannelPerformance(),
      () => mockApiService.getChannelPerformance()
    );
  }

  async getAudienceSegments(): Promise<AudienceSegment[]> {
    return this.getDataWithFallback(
      () => apiService.getAudienceSegments(),
      () => mockApiService.getAudienceSegments()
    );
  }

  async getCampaigns(): Promise<Campaign[]> {
    return this.getDataWithFallback(
      () => apiService.getCampaigns(),
      () => mockApiService.getCampaigns()
    );
  }

  async getMetrics(): Promise<MetricsData> {
    return this.getDataWithFallback(
      () => apiService.getMetrics(),
      () => mockApiService.getMetrics()
    );
  }

  async getDashboardData() {
    return this.getDataWithFallback(
      () => apiService.getDashboardData(),
      () => mockApiService.getDashboardData()
    );
  }

  // Method to force mock data (useful for testing)
  forceMockData() {
    this.useMockData = true;
  }

  // Method to force real API (useful for testing)
  forceRealApi() {
    this.useMockData = false;
  }

  // Method to check if currently using mock data
  isUsingMockData(): boolean {
    return this.useMockData;
  }
}
export const enhancedApiService = new EnhancedApiService();