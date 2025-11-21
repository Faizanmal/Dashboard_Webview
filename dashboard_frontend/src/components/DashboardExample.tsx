import React from 'react';
import { 
  useRevenueData, 
  useChannelPerformance, 
  useAudienceSegments, 
  useCampaigns, 
  useMetrics,
  useMockDataStatus 
} from '../hooks/useDashboardData';

export const DashboardExample: React.FC = () => {
  // Use the hooks to fetch data
  const { data: revenueData, isLoading: revenueLoading, error: revenueError } = useRevenueData();
  const { data: channelData, isLoading: channelLoading, error: channelError } = useChannelPerformance();
  const { data: audienceData, isLoading: audienceLoading, error: audienceError } = useAudienceSegments();
  const { data: campaignData, isLoading: campaignLoading, error: campaignError } = useCampaigns();
  const { data: metricsData, isLoading: metricsLoading, error: metricsError } = useMetrics();
  const { data: isUsingMock } = useMockDataStatus();

  // Check if any data is loading
  const isLoading = revenueLoading || channelLoading || audienceLoading || campaignLoading || metricsLoading;

  // Check if any errors occurred
  const hasErrors = revenueError || channelError || audienceError || campaignError || metricsError;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (hasErrors) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Data</h2>
          <p className="text-gray-600 mb-4">Some data failed to load. Please try again later.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Mock Data Indicator */}
      {isUsingMock && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-6">
          <div className="flex items-center">
            <span className="text-yellow-600 mr-2">⚠️</span>
            <span>Using mock data for development. Set up your API endpoints to use live data.</span>
          </div>
        </div>
      )}

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {metricsData && Object.entries(metricsData).map(([key, metric]) => {
          const titles: Record<string, string> = {
            totalRevenue: 'Total Revenue',
            totalUsers: 'Total Users',
            conversions: 'Conversions',
            growthRate: 'Growth Rate'
          };
          
          return (
            <div key={key} className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500">{titles[key]}</h3>
              <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
              <p className={`text-sm ${metric.changeType === 'increase' ? 'text-green-600' : 'text-red-600'}`}>
                {metric.changeType === 'increase' ? '↗' : '↘'} {metric.change}%
              </p>
            </div>
          );
        })}
      </div>

      {/* Revenue Chart */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Revenue Trend</h2>
        <div className="space-y-2">
          {revenueData?.map((item) => (
            <div key={item.name} className="flex justify-between items-center">
              <span className="text-gray-600">{item.name}</span>
              <span className="font-semibold">{item.value.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Channel Performance */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Channel Performance</h2>
        <div className="space-y-3">
          {channelData?.map((channel) => (
            <div key={channel.name} className="flex justify-between items-center">
              <span className="text-gray-600">{channel.name}</span>
              <div className="text-right">
                <div className="font-semibold">${channel.value.toLocaleString()}</div>
                <div className="text-sm text-gray-500">
                  vs ${channel.comparison.toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Campaigns Table */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Active Campaigns</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Client</th>
                <th className="text-left py-2">Campaign</th>
                <th className="text-right py-2">Revenue</th>
                <th className="text-right py-2">Impressions</th>
                <th className="text-right py-2">Clicks</th>
                <th className="text-right py-2">Conversions</th>
                <th className="text-center py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {campaignData?.slice(0, 5).map((campaign) => (
                <tr key={campaign.id} className="border-b">
                  <td className="py-2">{campaign.client}</td>
                  <td className="py-2">{campaign.campaign}</td>
                  <td className="text-right py-2">${campaign.revenue.toLocaleString()}</td>
                  <td className="text-right py-2">{campaign.impressions.toLocaleString()}</td>
                  <td className="text-right py-2">{campaign.clicks.toLocaleString()}</td>
                  <td className="text-right py-2">{campaign.conversions.toLocaleString()}</td>
                  <td className="text-center py-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      campaign.status === 'active' ? 'bg-green-100 text-green-800' :
                      campaign.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {campaign.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}; 