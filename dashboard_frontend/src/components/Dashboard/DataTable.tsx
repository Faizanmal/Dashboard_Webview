import React, { useState } from 'react';
import { ChevronUp, ChevronDown, Search, Filter, Download, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useExport } from '@/constants/export-context';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popver";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TableData {
  id: string;
  client: string;
  campaign: string;
  revenue: number;
  impressions: number;
  clicks: number;
  conversions: number;
  status: 'active' | 'paused' | 'completed';
}

interface DataTableProps {
  data: TableData[];
  title: string;
}

type SortField = keyof TableData;
type SortDirection = 'asc' | 'desc';

const DataTable = ({ data, title }: DataTableProps) => {
  const { exportToCsv } = useExport();
  const [sortField, setSortField] = useState<SortField>('revenue');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isExporting, setIsExporting] = useState(false);
  const [filters, setFilters] = useState<{
    status: string[];
    minRevenue: number | null;
    minConversions: number | null;
  }>({
    status: [],
    minRevenue: null,
    minConversions: null
  });
  const itemsPerPage = 10;

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleExport = () => {
    setIsExporting(true);

    try {
      // Format data for CSV export
      const exportData = sortedData.map(item => ({
        Client: item.client,
        Campaign: item.campaign,
        Revenue: `$${item.revenue.toLocaleString()}`,
        Impressions: item.impressions.toLocaleString(),
        Clicks: item.clicks.toLocaleString(),
        Conversions: item.conversions.toLocaleString(),
        Status: item.status.charAt(0).toUpperCase() + item.status.slice(1)
      }));

      exportToCsv(exportData, `${title.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.csv`);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error exporting data:', error);
      alert('Failed to export data. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const toggleStatusFilter = (status: string) => {
    setFilters(prev => {
      const newStatuses = prev.status.includes(status)
        ? prev.status.filter(s => s !== status)
        : [...prev.status, status];

      return { ...prev, status: newStatuses };
    });
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const clearFilters = () => {
    setFilters({
      status: [],
      minRevenue: null,
      minConversions: null
    });
    setCurrentPage(1);
  };

  const filteredData = data.filter(item => {
    // Text search filter
    const matchesSearch =
      item.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.campaign.toLowerCase().includes(searchTerm.toLowerCase());

    // Status filter
    const matchesStatus = filters.status.length === 0 || filters.status.includes(item.status);

    // Revenue filter
    const matchesRevenue = filters.minRevenue === null || item.revenue >= filters.minRevenue;

    // Conversions filter
    const matchesConversions = filters.minConversions === null || item.conversions >= filters.minConversions;

    return matchesSearch && matchesStatus && matchesRevenue && matchesConversions;
  });

  const sortedData = [...filteredData].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    const multiplier = sortDirection === 'asc' ? 1 : -1;

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return aValue.localeCompare(bValue) * multiplier;
    }
    return (Number(aValue) - Number(bValue)) * multiplier;
  });

  const paginatedData = sortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-chart-5 bg-chart-5/10';
      case 'paused': return 'text-chart-3 bg-chart-3/10';
      case 'completed': return 'text-muted-foreground bg-muted/30';
      default: return 'text-muted-foreground bg-muted/30';
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <div className="w-4 h-4" />;
    }
    return sortDirection === 'asc' ?
      <ChevronUp className="w-4 h-4" /> :
      <ChevronDown className="w-4 h-4" />;
  };

  const hasActiveFilters = filters.status.length > 0 ||
    filters.minRevenue !== null ||
    filters.minConversions !== null;

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">{title}</h3>
            <p className="text-sm text-muted-foreground">Manage and monitor campaign performance</p>
          </div>
          <div className="flex items-center space-x-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                  {hasActiveFilters && (
                    <span className="ml-1 w-2 h-2 bg-primary rounded-full"></span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="end">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Filter Campaigns</h4>
                    {hasActiveFilters && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearFilters}
                        className="h-8 px-2 text-xs"
                      >
                        <X className="w-3 h-3 mr-1" />
                        Clear filters
                      </Button>
                    )}
                  </div>

                  <div className="space-y-2">
                    <h5 className="text-sm font-medium">Status</h5>
                    <div className="grid grid-cols-1 gap-2">
                      {['active', 'paused', 'completed'].map(status => (
                        <div key={status} className="flex items-center space-x-2">
                          <Checkbox
                            id={`status-${status}`}
                            checked={filters.status.includes(status)}
                            onCheckedChange={() => toggleStatusFilter(status)}
                          />
                          <Label htmlFor={`status-${status}`} className="capitalize">
                            {status}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h5 className="text-sm font-medium">Minimum Revenue</h5>
                    <Select
                      value={filters.minRevenue?.toString() || "none"}
                      onValueChange={(value) => {
                        setFilters(prev => ({
                          ...prev,
                          minRevenue: value === "none" ? null : Number(value)
                        }));
                        setCurrentPage(1);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Any amount" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Any amount</SelectItem>
                        <SelectItem value="1000">$1,000+</SelectItem>
                        <SelectItem value="5000">$5,000+</SelectItem>
                        <SelectItem value="10000">$10,000+</SelectItem>
                        <SelectItem value="50000">$50,000+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <h5 className="text-sm font-medium">Minimum Conversions</h5>
                    <Select
                      value={filters.minConversions?.toString() || "none"}
                      onValueChange={(value) => {
                        setFilters(prev => ({
                          ...prev,
                          minConversions: value === "none" ? null : Number(value)
                        }));
                        setCurrentPage(1);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Any amount" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Any amount</SelectItem>
                        <SelectItem value="10">10+</SelectItem>
                        <SelectItem value="50">50+</SelectItem>
                        <SelectItem value="100">100+</SelectItem>
                        <SelectItem value="500">500+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              disabled={isExporting || sortedData.length === 0}
            >
              <Download className="w-4 h-4 mr-2" />
              {isExporting ? 'Exporting...' : 'Export'}
            </Button>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search campaigns or clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-muted/50 border-border"
            />
          </div>
          <div className="text-sm text-muted-foreground">
            {sortedData.length} of {data.length} campaigns
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/30">
            <tr>
              {[
                { key: 'client' as SortField, label: 'Client' },
                { key: 'campaign' as SortField, label: 'Campaign' },
                { key: 'revenue' as SortField, label: 'Revenue' },
                { key: 'impressions' as SortField, label: 'Impressions' },
                { key: 'clicks' as SortField, label: 'Clicks' },
                { key: 'conversions' as SortField, label: 'Conversions' },
                { key: 'status' as SortField, label: 'Status' }
              ].map(({ key, label }) => (
                <th
                  key={key}
                  className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground transition-colors"
                  onClick={() => handleSort(key)}
                >
                  <div className="flex items-center space-x-1">
                    <span>{label}</span>
                    <SortIcon field={key} />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {paginatedData.map((item) => (
              <tr
                key={item.id}
                className="hover:bg-muted/20 transition-colors duration-200 group"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-medium text-foreground group-hover:text-primary transition-colors">
                    {item.client}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-foreground">{item.campaign}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-semibold text-foreground">
                    {item.revenue !== undefined ? `$${item.revenue.toLocaleString()}` : ''}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-foreground">
                    {item.impressions.toLocaleString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-foreground">
                    {item.clicks.toLocaleString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-foreground">
                    {item.conversions.toLocaleString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={cn(
                    "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize",
                    getStatusColor(item.status)
                  )}>
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-border">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, sortedData.length)} of {sortedData.length} results
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              {Array.from({ length: totalPages }, (_, i) => (
                <Button
                  key={i + 1}
                  variant={currentPage === i + 1 ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(i + 1)}
                  className="w-8"
                >
                  {i + 1}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;