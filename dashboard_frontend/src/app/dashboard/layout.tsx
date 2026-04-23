import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard - Real-time Analytics',
  description: 'Real-time analytics dashboard with customizable widgets and data sources',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 space-y-4 p-8 pt-6">
        {children}
      </main>
    </div>
  );
}
