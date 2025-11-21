'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LayoutDashboard, TrendingUp, Bell, Database } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center space-y-4 mb-12">
          <h1 className="text-5xl font-bold tracking-tight">
            Real-time Analytics Dashboard
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Monitor your metrics in real-time with customizable dashboards, alerts, and data exports
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card>
            <CardHeader>
              <LayoutDashboard className="h-8 w-8 mb-2 text-primary" />
              <CardTitle className="text-lg">Custom Dashboards</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Create personalized dashboards with drag-and-drop widgets
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <TrendingUp className="h-8 w-8 mb-2 text-primary" />
              <CardTitle className="text-lg">Real-time Updates</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Live WebSocket connections for instant metric updates
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Bell className="h-8 w-8 mb-2 text-primary" />
              <CardTitle className="text-lg">Smart Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Set threshold-based alerts with email and webhook notifications
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Database className="h-8 w-8 mb-2 text-primary" />
              <CardTitle className="text-lg">Data Ingestion</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Connect external data sources via API with rate limiting
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Get Started</CardTitle>
            <CardDescription>Log in to access your dashboard</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              size="lg" 
              className="w-full"
              onClick={() => router.push('/login')}
            >
              Login to Dashboard
            </Button>
            
            <div className="text-sm text-muted-foreground space-y-1">
              <p className="font-semibold">Demo Accounts:</p>
              <p>• Admin: admin / admin123</p>
              <p>• Editor: editor / editor123</p>
              <p>• Viewer: viewer / viewer123</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
