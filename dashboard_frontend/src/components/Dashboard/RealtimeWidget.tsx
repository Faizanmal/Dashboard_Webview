'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useDashboardWebSocket } from '@/hooks/useWebSocket';
import { useRealtimeMetrics } from '@/hooks/useApi';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { ArrowUpIcon, ArrowDownIcon, TrendingUpIcon } from 'lucide-react';

interface RealtimeWidgetProps {
  widgetId: number;
  widgetType: string;
  title: string;
  metricName: string;
  dashboardId: number;
  refreshInterval?: number;
}

export function RealtimeWidget({
  widgetId,
  widgetType,
  title,
  metricName,
  dashboardId,
  refreshInterval = 5000,
}: RealtimeWidgetProps) {
  const { isConnected, lastMessage, subscribeToMetrics } = useDashboardWebSocket(dashboardId);
  const [currentValue, setCurrentValue] = useState<number | null>(null);
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [history, setHistory] = useState<Array<{ timestamp: string; value: number }>>([]);

  const { data: metricsData } = useRealtimeMetrics([metricName], '1h', isConnected);

  useEffect(() => {
    if (isConnected) {
      subscribeToMetrics([metricName]);
    }
  }, [isConnected, metricName, subscribeToMetrics]);

  useEffect(() => {
    if (lastMessage?.type === 'metric_update' && lastMessage.metric_name === metricName) {
      setPreviousValue(currentValue);
      setCurrentValue(lastMessage.value);
      
      setHistory((prev) => {
        const newHistory = [
          ...prev,
          { timestamp: new Date().toISOString(), value: lastMessage.value },
        ].slice(-20); // Keep last 20 data points
        return newHistory;
      });
    }
  }, [lastMessage, metricName, currentValue]);

  useEffect(() => {
    if (metricsData?.[metricName]?.length > 0) {
      const latestData = metricsData[metricName];
      setHistory(latestData.slice(-20));
      setCurrentValue(latestData[latestData.length - 1]?.value || null);
    }
  }, [metricsData, metricName]);

  const getChangePercentage = () => {
    if (currentValue === null || previousValue === null || previousValue === 0) return null;
    return ((currentValue - previousValue) / previousValue) * 100;
  };

  const changePercentage = getChangePercentage();

  if (widgetType === 'metric_card') {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardDescription className="text-xs">{title}</CardDescription>
          <CardTitle className="flex items-baseline gap-2">
            <span className="text-3xl font-bold">
              {currentValue !== null ? currentValue.toLocaleString() : '—'}
            </span>
            {changePercentage !== null && (
              <span
                className={`flex items-center text-sm ${
                  changePercentage > 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {changePercentage > 0 ? (
                  <ArrowUpIcon className="h-4 w-4" />
                ) : (
                  <ArrowDownIcon className="h-4 w-4" />
                )}
                {Math.abs(changePercentage).toFixed(1)}%
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center text-xs text-muted-foreground">
            <TrendingUpIcon className="h-3 w-3 mr-1" />
            {isConnected ? 'Live updates' : 'Connecting...'}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (widgetType === 'line_chart' || widgetType === 'area_chart') {
    const chartData = history.map((item) => ({
      time: new Date(item.timestamp).toLocaleTimeString(),
      value: item.value,
    }));

    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{title}</CardTitle>
          <CardDescription className="text-xs">
            {isConnected ? 'Real-time updates' : 'Connecting...'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="time" 
                className="text-xs" 
                tick={{ fontSize: 10 }}
              />
              <YAxis className="text-xs" tick={{ fontSize: 10 }} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="value"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={false}
                name={metricName}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>Real-time widget</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">
          {currentValue !== null ? currentValue.toLocaleString() : '—'}
        </p>
      </CardContent>
    </Card>
  );
}
