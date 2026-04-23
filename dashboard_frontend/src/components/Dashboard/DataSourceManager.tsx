'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useDataSources, useCreateDataSource, useDeleteDataSource, useRegenerateApiKey } from '@/hooks/useApi';
import { useState } from 'react';
import { Plus, Trash2, RefreshCw, Copy, Check } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

export function DataSourceManager() {
  const { data: dataSources, isLoading } = useDataSources();
  const createMutation = useCreateDataSource();
  const deleteMutation = useDeleteDataSource();
  const regenerateMutation = useRegenerateApiKey();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [sourceName, setSourceName] = useState('');
  const [description, setDescription] = useState('');
  const [rateLimit, setRateLimit] = useState(100);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMutation.mutateAsync({
        source_name: sourceName,
        description,
        rate_limit: rateLimit,
      });
      toast.success('Data source created successfully');
      setIsCreateOpen(false);
      setSourceName('');
      setDescription('');
      setRateLimit(100);
    } catch {
      toast.error('Failed to create data source');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this data source?')) {
      try {
        await deleteMutation.mutateAsync(id);
        toast.success('Data source deleted');
      } catch {
        toast.error('Failed to delete data source');
      }
    }
  };

  const handleRegenerate = async (id: number) => {
    if (confirm('This will invalidate the old API key. Continue?')) {
      try {
        await regenerateMutation.mutateAsync(id);
        toast.success('API key regenerated');
      } catch {
        toast.error('Failed to regenerate API key');
      }
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(text);
    toast.success('API key copied to clipboard');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  if (isLoading) {return <div>Loading data sources...</div>;}

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Data Sources</h2>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Data Source
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {dataSources?.map((source) => (
          <Card key={source.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{source.source_name}</span>
                <span
                  className={`text-xs px-2 py-1 rounded ${source.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}
                >
                  {source.is_active ? 'Active' : 'Inactive'}
                </span>
              </CardTitle>
              <CardDescription>{source.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-sm space-y-1">
                <p>
                  <span className="font-medium">Rate Limit:</span> {source.rate_limit} req/hour
                </p>
                <p>
                  <span className="font-medium">Total Requests:</span> {source.total_requests}
                </p>
                <p>
                  <span className="font-medium">Events:</span> {source.event_count}
                </p>
              </div>

              {source.api_key && (
                <div className="mt-3 p-2 bg-muted rounded text-xs font-mono flex items-center justify-between">
                  <span className="truncate">{source.api_key.substring(0, 20)}...</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(source.api_key!)}
                  >
                    {copiedKey === source.api_key ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              )}

              <div className="flex gap-2 mt-4">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleRegenerate(source.id)}
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Regenerate
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(source.id)}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Data Source</DialogTitle>
            <DialogDescription>
              Create a new data source for external data ingestion
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="source-name">Source Name</Label>
                <Input
                  id="source-name"
                  value={sourceName}
                  onChange={(e) => setSourceName(e.target.value)}
                  placeholder="My External App"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Data from external application..."
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rate-limit">Rate Limit (requests/hour)</Label>
                <Input
                  id="rate-limit"
                  type="number"
                  value={rateLimit}
                  onChange={(e) => setRateLimit(parseInt(e.target.value))}
                  min={1}
                  max={10000}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                Create
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
