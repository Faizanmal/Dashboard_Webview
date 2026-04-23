'use client';

import { useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useWidgets } from '@/hooks/useDashboard';
import { useDashboardStore } from '@/stores/dashboardStore';

import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Plus,

  LogOut,
  Database,
  Bell,
  FileDown,
  Menu
} from 'lucide-react';
import { RealtimeWidget } from '@/components/Dashboard/RealtimeWidget';
import { DashboardDialog } from '@/components/Dashboard/DashboardDialog';
import { DataSourceManager } from '@/components/Dashboard/DataSourceManager';
import { AlertManager } from '@/components/Dashboard/AlertManager';
import { ExportManager } from '@/components/Dashboard/ExportManager';
import { useAuth } from '@/hooks/useAuth';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}

function DashboardContent() {
  const { logout, user, userRole } = useAuth();

  const currentDashboard = useDashboardStore((state) => state.currentDashboard);
  const { data: widgets, isLoading: loadingWidgets } = useWidgets(currentDashboard?.id);

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isEditor = userRole?.role === 'editor' || userRole?.role === 'admin';


  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="flex h-16 items-center px-4 gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="flex items-center gap-2">
            <LayoutDashboard className="h-6 w-6" />
            <h1 className="text-xl font-bold">Dashboard</h1>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <span className="text-sm text-muted-foreground hidden sm:inline">
              {user?.username} ({userRole?.role})
            </span>
            <Button variant="outline" size="sm" onClick={logout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`
          w-64 border-r min-h-[calc(100vh-4rem)] bg-muted/40 p-4
          ${isMobileMenuOpen ? 'block' : 'hidden'} md:block
        `}>
          <nav className="space-y-2">
            <Button
              variant={activeTab === 'dashboard' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => {
                setActiveTab('dashboard');
                setIsMobileMenuOpen(false);
              }}
            >
              <LayoutDashboard className="h-4 w-4 mr-2" />
              Dashboard
            </Button>

            {isEditor && (
              <Button
                variant={activeTab === 'data-sources' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => {
                  setActiveTab('data-sources');
                  setIsMobileMenuOpen(false);
                }}
              >
                <Database className="h-4 w-4 mr-2" />
                Data Sources
              </Button>
            )}

            {isEditor && (
              <Button
                variant={activeTab === 'alerts' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => {
                  setActiveTab('alerts');
                  setIsMobileMenuOpen(false);
                }}
              >
                <Bell className="h-4 w-4 mr-2" />
                Alerts
              </Button>
            )}

            <Button
              variant={activeTab === 'exports' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => {
                setActiveTab('exports');
                setIsMobileMenuOpen(false);
              }}
            >
              <FileDown className="h-4 w-4 mr-2" />
              Exports
            </Button>
          </nav>

          {isEditor && (
            <div className="mt-6">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setIsCreateDialogOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                New Dashboard
              </Button>
            </div>
          )}
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Dashboard Info */}
              {currentDashboard && (
                <Card>
                  <CardHeader>
                    <CardTitle>{currentDashboard.name}</CardTitle>
                    {currentDashboard.description && (
                      <CardDescription>{currentDashboard.description}</CardDescription>
                    )}
                  </CardHeader>
                </Card>
              )}

              {/* Widgets Grid */}
              {loadingWidgets ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3, 4].map((i) => (
                    <Card key={i}>
                      <CardHeader>
                        <Skeleton className="h-4 w-32" />
                      </CardHeader>
                      <CardContent>
                        <Skeleton className="h-24 w-full" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : widgets && widgets.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {widgets.map((widget) => (
                    <RealtimeWidget
                      key={widget.id}
                      widgetId={widget.id}
                      widgetType={widget.widget_type}
                      title={widget.title}
                      metricName={widget.data_source || 'total_revenue'}
                      dashboardId={currentDashboard?.id || 1}
                      refreshInterval={widget.refresh_interval || 5000}
                    />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center text-muted-foreground">
                      <p>No widgets configured yet.</p>
                      {isEditor && (
                        <Button className="mt-4" variant="outline">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Widget
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {activeTab === 'data-sources' && isEditor && <DataSourceManager />}
          {activeTab === 'alerts' && isEditor && <AlertManager />}
          {activeTab === 'exports' && <ExportManager />}
        </main>
      </div>

      <DashboardDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        mode="create"
      />
    </div>
  );
}
