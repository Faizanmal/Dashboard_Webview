'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { DataSource, Alert, ExportJob } from '@/lib/dashboardApi';
import { dashboardApi } from '@/lib/dashboardApi';
import { useAuthStore } from '@/stores/authStore';

// Data Sources
export function useDataSources() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: ['dataSources'],
    queryFn: () => dashboardApi.getDataSources(),
    enabled: isAuthenticated,
  });
}

export function useCreateDataSource() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<DataSource>) => dashboardApi.createDataSource(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dataSources'] });
    },
  });
}

export function useDeleteDataSource() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => dashboardApi.deleteDataSource(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dataSources'] });
    },
  });
}

export function useRegenerateApiKey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => dashboardApi.regenerateApiKey(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dataSources'] });
    },
  });
}

// Alerts
export function useAlerts() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: ['alerts'],
    queryFn: () => dashboardApi.getAlerts(),
    enabled: isAuthenticated,
  });
}

export function useTriggeredAlerts() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: ['alerts', 'triggered'],
    queryFn: () => dashboardApi.getTriggeredAlerts(),
    enabled: isAuthenticated,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

export function useCreateAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Alert>) => dashboardApi.createAlert(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    },
  });
}

export function useUpdateAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Alert> }) =>
      dashboardApi.updateAlert(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    },
  });
}

export function useDeleteAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => dashboardApi.deleteAlert(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    },
  });
}

// Export Jobs
export function useExportJobs() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: ['exportJobs'],
    queryFn: () => dashboardApi.getExportJobs(),
    enabled: isAuthenticated,
  });
}

export function useCreateExportJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<ExportJob>) => dashboardApi.createExportJob(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exportJobs'] });
    },
  });
}

export function useExportJob(id: number) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: ['exportJob', id],
    queryFn: () => dashboardApi.getExportJob(id),
    enabled: isAuthenticated && !!id,
    refetchInterval: (query) => {
      const data = query.state.data;
      // Stop refetching if status is completed or failed
      if (data?.status === 'completed' || data?.status === 'failed') {
        return false;
      }
      return 2000; // Refetch every 2 seconds while processing
    },
  });
}

// Real-time Metrics
export function useRealtimeMetrics(
  metricNames: string[],
  range: '1h' | '6h' | '24h' | '7d' = '1h',
  enabled = true
) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: ['metrics', 'realtime', metricNames, range],
    queryFn: () => dashboardApi.getRealtimeMetrics(metricNames, range),
    enabled: isAuthenticated && enabled && metricNames.length > 0,
    refetchInterval: 5000, // Refetch every 5 seconds for real-time feel
  });
}

export function usePostMetric() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      metric_name: string;
      value: number;
      unit?: string;
      tags?: Record<string, unknown>;
    }) => dashboardApi.postMetric(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['metrics'] });
    },
  });
}
