import { create } from 'zustand';
import { Dashboard, Widget } from '@/lib/dashboardApi';

interface DashboardState {
  currentDashboard: Dashboard | null;
  dashboards: Dashboard[];
  widgets: Widget[];
  isLoading: boolean;
  error: string | null;
  
  setCurrentDashboard: (dashboard: Dashboard | null) => void;
  setDashboards: (dashboards: Dashboard[]) => void;
  setWidgets: (widgets: Widget[]) => void;
  addWidget: (widget: Widget) => void;
  updateWidget: (id: number, widget: Partial<Widget>) => void;
  removeWidget: (id: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  currentDashboard: null,
  dashboards: [],
  widgets: [],
  isLoading: false,
  error: null,

  setCurrentDashboard: (dashboard) => set({ currentDashboard: dashboard }),
  
  setDashboards: (dashboards) => set({ dashboards }),
  
  setWidgets: (widgets) => set({ widgets }),
  
  addWidget: (widget) => set((state) => ({
    widgets: [...state.widgets, widget],
  })),
  
  updateWidget: (id, updatedWidget) => set((state) => ({
    widgets: state.widgets.map((w) => 
      w.id === id ? { ...w, ...updatedWidget } : w
    ),
  })),
  
  removeWidget: (id) => set((state) => ({
    widgets: state.widgets.filter((w) => w.id !== id),
  })),
  
  setLoading: (loading) => set({ isLoading: loading }),
  
  setError: (error) => set({ error }),
}));
