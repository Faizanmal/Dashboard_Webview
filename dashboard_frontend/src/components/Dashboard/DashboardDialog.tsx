'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCreateDashboard, useUpdateDashboard } from '@/hooks/useDashboard';
import type { Dashboard } from '@/lib/dashboardApi';
import { toast } from 'sonner';

interface DashboardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dashboard?: Dashboard;
  mode: 'create' | 'edit';
}

export function DashboardDialog({ open, onOpenChange, dashboard, mode }: DashboardDialogProps) {
  const [name, setName] = useState(dashboard?.name || '');
  const [description, setDescription] = useState(dashboard?.description || '');
  const [isDefault, setIsDefault] = useState(dashboard?.is_default || false);

  const createMutation = useCreateDashboard();
  const updateMutation = useUpdateDashboard();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (mode === 'create') {
        await createMutation.mutateAsync({ name, description, is_default: isDefault });
        toast.success('Dashboard created successfully');
      } else if (dashboard) {
        await updateMutation.mutateAsync({
          id: dashboard.id,
          data: { name, description, is_default: isDefault },
        });
        toast.success('Dashboard updated successfully');
      }
      onOpenChange(false);
      setName('');
      setDescription('');
      setIsDefault(false);
    } catch {
      toast.error('Failed to save dashboard');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Create Dashboard' : 'Edit Dashboard'}</DialogTitle>
          <DialogDescription>
            {mode === 'create' ? 'Create a new custom dashboard' : 'Update dashboard details'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="My Dashboard"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Dashboard description..."
                rows={3}
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isDefault"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
                className="h-4 w-4"
              />
              <Label htmlFor="isDefault" className="cursor-pointer">
                Set as default dashboard
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
              {mode === 'create' ? 'Create' : 'Update'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
