'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAlerts, useCreateAlert, useDeleteAlert, useTriggeredAlerts } from '@/hooks/useApi';
import { useState } from 'react';
import { Plus, Trash2, Bell } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

export function AlertManager() {
  const { data: alerts, isLoading } = useAlerts();
  const { data: triggeredAlerts } = useTriggeredAlerts();
  const createMutation = useCreateAlert();
  const deleteMutation = useDeleteAlert();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [metricName, setMetricName] = useState('');
  const [comparisonType, setComparisonType] = useState<'gt' | 'lt' | 'eq' | 'gte' | 'lte'>('gt');
  const [thresholdValue, setThresholdValue] = useState('');
  const [notificationEmail, setNotificationEmail] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMutation.mutateAsync({
        name,
        description,
        metric_name: metricName,
        comparison_type: comparisonType,
        threshold_value: parseFloat(thresholdValue),
        notification_email: notificationEmail,
        webhook_url: webhookUrl,
      });
      toast.success('Alert created successfully');
      setIsCreateOpen(false);
      resetForm();
    } catch {
      toast.error('Failed to create alert');
    }
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setMetricName('');
    setComparisonType('gt');
    setThresholdValue('');
    setNotificationEmail('');
    setWebhookUrl('');
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this alert?')) {
      try {
        await deleteMutation.mutateAsync(id);
        toast.success('Alert deleted');
      } catch {
        toast.error('Failed to delete alert');
      }
    }
  };

  if (isLoading) {return <div>Loading alerts...</div>;}

  return (
    <div className="space-y-6">
      {/* Triggered Alerts Banner */}
      {triggeredAlerts && triggeredAlerts.length > 0 && (
        <Card className="border-orange-500 bg-orange-50 dark:bg-orange-950">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-300">
              <Bell className="h-5 w-5" />
              {triggeredAlerts.length} Alert{triggeredAlerts.length > 1 ? 's' : ''} Triggered
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {triggeredAlerts.map((alert) => (
                <div key={alert.id} className="flex items-center justify-between p-2 bg-white dark:bg-gray-900 rounded">
                  <div>
                    <p className="font-medium">{alert.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {alert.metric_name} {alert.comparison_type} {alert.threshold_value}
                    </p>
                  </div>
                  <Badge variant="destructive">Triggered</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Alert Configuration</h2>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Alert
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {alerts?.map((alert) => (
          <Card key={alert.id} className={alert.status === 'triggered' ? 'border-orange-500' : ''}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{alert.name}</span>
                <Badge
                  variant={
                    alert.status === 'active'
                      ? 'default'
                      : alert.status === 'triggered'
                        ? 'destructive'
                        : 'secondary'
                  }
                >
                  {alert.status}
                </Badge>
              </CardTitle>
              <CardDescription>{alert.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-sm space-y-1">
                <p>
                  <span className="font-medium">Metric:</span> {alert.metric_name}
                </p>
                <p>
                  <span className="font-medium">Condition:</span> {alert.comparison_type} {alert.threshold_value}
                </p>
                {alert.notification_email && (
                  <p>
                    <span className="font-medium">Email:</span> {alert.notification_email}
                  </p>
                )}
                {alert.last_triggered && (
                  <p>
                    <span className="font-medium">Last Triggered:</span>{' '}
                    {new Date(alert.last_triggered).toLocaleString()}
                  </p>
                )}
              </div>

              <div className="flex gap-2 mt-4">
                <Button size="sm" variant="destructive" onClick={() => handleDelete(alert.id)}>
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Alert</DialogTitle>
            <DialogDescription>
              Set up threshold-based monitoring for your metrics
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate}>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="alert-name">Name</Label>
                  <Input
                    id="alert-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="High Revenue Alert"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="metric-name">Metric Name</Label>
                  <Input
                    id="metric-name"
                    value={metricName}
                    onChange={(e) => setMetricName(e.target.value)}
                    placeholder="total_revenue"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Alert when revenue exceeds threshold..."
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="comparison">Comparison Type</Label>
                  <Select value={comparisonType} onValueChange={(value: string) => setComparisonType(value as 'gt' | 'lt' | 'eq' | 'gte' | 'lte')}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gt">Greater Than (&gt;)</SelectItem>
                      <SelectItem value="gte">Greater Than or Equal (≥)</SelectItem>
                      <SelectItem value="lt">Less Than (&lt;)</SelectItem>
                      <SelectItem value="lte">Less Than or Equal (≤)</SelectItem>
                      <SelectItem value="eq">Equal To (=)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="threshold">Threshold Value</Label>
                  <Input
                    id="threshold"
                    type="number"
                    step="0.01"
                    value={thresholdValue}
                    onChange={(e) => setThresholdValue(e.target.value)}
                    placeholder="100000"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Notification Email (optional)</Label>
                  <Input
                    id="email"
                    type="email"
                    value={notificationEmail}
                    onChange={(e) => setNotificationEmail(e.target.value)}
                    placeholder="admin@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="webhook">Webhook URL (optional)</Label>
                  <Input
                    id="webhook"
                    type="url"
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    placeholder="https://hooks.slack.com/..."
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                Create Alert
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
