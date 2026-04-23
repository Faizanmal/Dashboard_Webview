"use client";

import React, { useState } from 'react';
import { useTheme } from 'next-themes';
import { BarChart3, TrendingUp, Users, DollarSign, PieChart, Settings, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/ThemeButton';
import { cn } from '@/lib/utils';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { ExportContext } from '@/constants/export-context';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const { theme, setTheme } = useTheme();

  const navigation = [
    { name: 'Overview', icon: BarChart3, href: '#', current: true },
    { name: 'Analytics', icon: TrendingUp, href: '#', current: false },
    { name: 'Users', icon: Users, href: '#', current: false },
    { name: 'Revenue', icon: DollarSign, href: '#', current: false },
    { name: 'Reports', icon: PieChart, href: '#', current: false },
    { name: 'Settings', icon: Settings, href: '#', current: false },
  ];

  const exportToPdf = async () => {
    setIsExporting(true);
    const originalTheme = theme;
    // Force light theme for PDF export for consistency
    setTheme('light');

    // Allow time for theme to apply
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      const chartElements = document.querySelectorAll('.chart-container');
      const pdf = new jsPDF('p', 'mm', 'a4');
      let yOffset = 10;

      pdf.setFontSize(16);
      pdf.text('Dashboard Report', 105, yOffset, { align: 'center' });
      yOffset += 10;

      pdf.setFontSize(10);
      pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, yOffset, { align: 'center' });
      yOffset += 15;

      const canvasOptions = {
        scale: 2,
        logging: false,
        useCORS: true,
        backgroundColor: '#ffffff', // Explicitly set white background
      };

      if (chartElements.length === 0) {
        const dashboardContent = document.querySelector('main');
        if (dashboardContent) {
          const canvas = await html2canvas(dashboardContent as HTMLElement, {
            ...canvasOptions,
            scale: 1.5,
            allowTaint: true,
          });

          const imgWidth = 210;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          const imgData = canvas.toDataURL('image/png');

          pdf.addImage(imgData, 'PNG', 0, yOffset, imgWidth, imgHeight);
          pdf.save('dashboard-report.pdf');
        }
      } else {
        for (let i = 0; i < chartElements.length; i++) {
          const chart = chartElements[i] as HTMLElement;
          const canvas = await html2canvas(chart, canvasOptions);

          const chartTitle = chart.getAttribute('data-title') || `Chart ${i + 1}`;
          if (yOffset > 240 && i > 0) {
            pdf.addPage();
            yOffset = 10;
          }

          pdf.setFontSize(12);
          pdf.text(chartTitle, 105, yOffset, { align: 'center' });
          yOffset += 5;

          const imgData = canvas.toDataURL('image/png');
          const imgWidth = 180;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;

          pdf.addImage(imgData, 'PNG', 15, yOffset, imgWidth, imgHeight);
          yOffset += imgHeight + 15;
        }

        pdf.save('dashboard-report.pdf');
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error exporting to PDF:', error);
      alert('Failed to export report. Please try again.');
    } finally {
      // Revert to the original theme
      if (originalTheme) {
        setTheme(originalTheme);
      }
      setIsExporting(false);
    }
  };

  type ExportableRow = {
    [key: string]: string | number | boolean | null | undefined;
  };

  const exportToCsv = (data: ExportableRow[], filename: string) => {
    if (!data || !data.length) {
      alert('No data to export');
      return;
    }

    try {
      const headers = Object.keys(data[0]);
      const csvRows = [
        headers.join(','),
        ...data.map(row =>
          headers.map(header => {
            const cell = row[header] ?? '';
            const value = cell.toString().replace(/"/g, '""');
            return `"${value}"`;
          }).join(',')
        ),
      ];

      const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error exporting to CSV:', error);
      alert('Failed to export data. Please try again.');
    }
  };

  const exportContextValue = { exportToPdf, exportToCsv };

  return (
    <ExportContext.Provider value={exportContextValue}>
      <div className="min-h-screen bg-gradient-to-br from-dashboard-bg via-background to-dashboard-bg">
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        <div className={cn("fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 ease-smooth", sidebarOpen ? "translate-x-0" : "-translate-x-full")}>
          <div className="flex flex-col h-full bg-gradient-glass backdrop-blur-xl border-r border-glass-border shadow-glass">
            <div className="flex items-center justify-between px-6 py-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-glow">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-foreground">Dashboard</h1>
                  <p className="text-sm text-muted-foreground">Insights</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            <nav className="flex-1 px-4 space-y-2">
              {navigation.map((item) => (
                <a key={item.name} href={item.href} className={cn(
                  "flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group",
                  item.current
                    ? "bg-gradient-primary text-white shadow-glow"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                )}>
                  <item.icon className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform duration-200" />
                  {item.name}
                </a>
              ))}
            </nav>
          </div>
        </div>

        <div className={cn("transition-all duration-300 ease-smooth", sidebarOpen ? "lg:pl-72" : "lg:pl-0")}>
          <div className="sticky top-0 z-30 bg-gradient-glass backdrop-blur-xl border-b border-glass-border shadow-glass">
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
                  <Menu className="w-5 h-5" />
                </Button>
                <div>
                  <h2 className="text-xl font-bold text-foreground">Dashboard Overview</h2>
                  <p className="text-sm text-muted-foreground">Welcome back! Here's what's happening with your campaigns.</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="hidden md:flex items-center space-x-2 text-sm text-muted-foreground">
                  <div className="w-2 h-2 bg-accent rounded-full animate-pulse-glow" />
                  Live Data
                </div>
                <ThemeToggle />
                <Button variant="outline" size="sm" onClick={exportToPdf} disabled={isExporting}>
                  {isExporting ? 'Exporting...' : 'Export Report'}
                </Button>
              </div>
            </div>
          </div>

          <main className="p-6">
            {children}
          </main>
        </div>
      </div>
    </ExportContext.Provider>
  );
};

export default DashboardLayout;
