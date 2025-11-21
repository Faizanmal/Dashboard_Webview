'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dashboardApi, Dashboard, Widget } from '@/lib/dashboardApi';
import { useAuthStore } from '@/stores/authStore';
import { useDashboardStore } from '@/stores/dashboardStore';

export function useDashboards() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: ['dashboards'],
    queryFn: () => dashboardApi.getDashboards(),
    enabled: isAuthenticated,
  });
}

export function useDashboard(id: number) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: ['dashboard', id],
    queryFn: () => dashboardApi.getDashboard(id),
    enabled: isAuthenticated && !!id,
  });
}

export function useDefaultDashboard() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const setCurrentDashboard = useDashboardStore((state) => state.setCurrentDashboard);

  return useQuery({
    queryKey: ['dashboard', 'default'],
    queryFn: async () => {
      const dashboard = await dashboardApi.getDefaultDashboard();
      setCurrentDashboard(dashboard);
      return dashboard;
    },
    enabled: isAuthenticated,
  });
}

export function useCreateDashboard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Dashboard>) => dashboardApi.createDashboard(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboards'] });
    },
  });
}

export function useUpdateDashboard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Dashboard> }) =>
      dashboardApi.updateDashboard(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['dashboard', id] });
      queryClient.invalidateQueries({ queryKey: ['dashboards'] });
    },
  });
}

export function useDeleteDashboard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => dashboardApi.deleteDashboard(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboards'] });
    },
  });
}

export function useDuplicateDashboard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => dashboardApi.duplicateDashboard(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboards'] });
    },
  });
}

export function useWidgets(dashboardId?: number) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const setWidgets = useDashboardStore((state) => state.setWidgets);

  return useQuery({
    queryKey: ['widgets', dashboardId],
    queryFn: async () => {
      const widgets = await dashboardApi.getWidgets(dashboardId);
      setWidgets(widgets);
      return widgets;
    },
    enabled: isAuthenticated,
  });
}

export function useCreateWidget() {
  const queryClient = useQueryClient();
  const addWidget = useDashboardStore((state) => state.addWidget);

  return useMutation({
    mutationFn: (data: Partial<Widget>) => dashboardApi.createWidget(data),
    onSuccess: (widget) => {
      addWidget(widget);
      queryClient.invalidateQueries({ queryKey: ['widgets'] });
    },
  });
}

export function useUpdateWidget() {
  const queryClient = useQueryClient();
  const updateWidget = useDashboardStore((state) => state.updateWidget);

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Widget> }) =>
      dashboardApi.updateWidget(id, data),
    onSuccess: (widget) => {
      updateWidget(widget.id, widget);
      queryClient.invalidateQueries({ queryKey: ['widgets'] });
    },
  });
}

export function useDeleteWidget() {
  const queryClient = useQueryClient();
  const removeWidget = useDashboardStore((state) => state.removeWidget);

  return useMutation({
    mutationFn: (id: number) => dashboardApi.deleteWidget(id),
    onSuccess: (_, id) => {
      removeWidget(id);
      queryClient.invalidateQueries({ queryKey: ['widgets'] });
    },
  });
}

export function useBulkUpdateWidgetPositions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      positions: Array<{ id: number; x: number; y: number; width?: number; height?: number }>
    ) => dashboardApi.bulkUpdateWidgetPositions(positions),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['widgets'] });
    },
  });
}
