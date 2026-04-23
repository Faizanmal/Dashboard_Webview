'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useExportJobs, useCreateExportJob } from '@/hooks/useApi';
import { useState } from 'react';
import { Plus, Download, FileText, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

export function ExportManager() {
  const { data: exportJobs, isLoading } = useExportJobs();
  const createMutation = useCreateExportJob();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [name, setName] = useState('');
  const [format, setFormat] = useState<'csv' | 'excel' | 'pdf' | 'json'>('csv');
  const [dashboardId, setDashboardId] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMutation.mutateAsync({
        name,
        format,
        dashboard: dashboardId ? parseInt(dashboardId) : undefined,
      });
      toast.success('Export job created successfully');
      setIsCreateOpen(false);
      setName('');
      setFormat('csv');
      setDashboardId('');
    } catch {
      toast.error('Failed to create export job');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'processing':
        return <Clock className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  if (isLoading) {return <div>Loading export jobs...</div>;}

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Export Jobs</h2>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Export
        </Button>
      </div>

      <div className="space-y-3">
        {exportJobs?.map((job) => (
          <Card key={job.id}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-base">
                <span className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  {job.name}
                </span>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="uppercase">
                    {job.format}
                  </Badge>
                  {getStatusIcon(job.status)}
                </div>
              </CardTitle>
              <CardDescription className="text-xs">
                Created: {new Date(job.created_at).toLocaleString()}
                {job.completed_at && ` • Completed: ${new Date(job.completed_at).toLocaleString()}`}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <span className="font-medium">Status:</span>{' '}
                  <span className={`capitalize ${job.status === 'completed' ? 'text-green-600' :
                    job.status === 'failed' ? 'text-red-600' :
                      job.status === 'processing' ? 'text-blue-600' :
                        'text-gray-600'
                    }`}>
                    {job.status}
                  </span>
                </div>
                {job.status === 'completed' && job.file_path && (
                  <Button size="sm" variant="outline">
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                )}
                {job.status === 'failed' && job.error_message && (
                  <p className="text-xs text-red-600">{job.error_message}</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Export Job</DialogTitle>
            <DialogDescription>
              Export your dashboard data in various formats
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="export-name">Export Name</Label>
                <Input
                  id="export-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Monthly Revenue Report"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="format">Format</Label>
                <Select value={format} onValueChange={(value: string) => setFormat(value as 'csv' | 'excel' | 'pdf' | 'json')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="excel">Excel</SelectItem>
                    <SelectItem value="json">JSON</SelectItem>
                    <SelectItem value="pdf">PDF</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dashboard-id">Dashboard ID (optional)</Label>
                <Input
                  id="dashboard-id"
                  type="number"
                  value={dashboardId}
                  onChange={(e) => setDashboardId(e.target.value)}
                  placeholder="1"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                Create Export
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
