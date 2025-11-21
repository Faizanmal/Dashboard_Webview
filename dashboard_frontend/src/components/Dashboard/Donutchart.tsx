import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { CHART_STYLES, type DonutChartData } from '@/constants/dashboards';
import { DonutTooltip } from './shared/ChartToolTip';
import { ChartHeader } from './shared/ChartHeader';

interface DashboardDonutChartProps {
  data: DonutChartData[];
  title: string;
}

const DashboardDonutChart = ({ data, title }: DashboardDonutChartProps) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const dataWithTotal = data.map(item => ({ ...item, total }));

  return (
    <div className={CHART_STYLES.container}>
      <ChartHeader title={title} dividerStyle="primary" />
      
      <div className="flex items-center justify-between">
        <div className="relative h-64 w-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={dataWithTotal}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
              >
                {dataWithTotal.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color}
                    stroke="hsl(var(--background))"
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Tooltip content={<DonutTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          
          {/* Center total */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{total.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Total</p>
            </div>
          </div>
        </div>
        
        {/* Legend */}
        <div className="flex-1 ml-8 space-y-3">
          {dataWithTotal.map((entry, index) => (
            <div key={index} className="flex items-center justify-between p-2 rounded-lg hover:bg-secondary/30 transition-colors">
              <div className="flex items-center">
                <div 
                  className="w-4 h-4 rounded-full mr-3" 
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-sm font-medium text-foreground">{entry.name}</span>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-foreground">{entry.value.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">
                  {((entry.value / total) * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardDonutChart;