import { BarChart, Bar, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DEFAULT_CHART_COLORS, CHART_MARGINS, CHART_STYLES, type BarChartData } from '@/constants/dashboards';
import { ChartTooltip } from './shared/ChartToolTip';
import { XAxis, YAxis } from './shared/ChartAxisConfig';
import { ChartHeader } from './shared/ChartHeader';

interface DashboardBarChartProps {
  data: BarChartData[];
  title: string;
  colors?: string[];
}

const DashboardBarChart = ({ 
  data, 
  title, 
  colors = DEFAULT_CHART_COLORS 
}: DashboardBarChartProps) => {
  return (
    <div className={CHART_STYLES.container}>
      <ChartHeader title={title} dividerStyle="accent" />
      
      <div className={CHART_STYLES.chartHeight}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={CHART_MARGINS}>
            <defs>
              <linearGradient id="barGradient1" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colors[0]} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={colors[0]} stopOpacity={0.4}/>
              </linearGradient>
              <linearGradient id="barGradient2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colors[1]} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={colors[1]} stopOpacity={0.4}/>
              </linearGradient>
            </defs>
            
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke={CHART_STYLES.grid} 
              opacity={0.3}
            />
            
            <XAxis dataKey="name" />
            <YAxis />
            
            <Tooltip content={<ChartTooltip />} />
            
            <Bar 
              dataKey="value" 
              fill="url(#barGradient1)"
              radius={[4, 4, 0, 0]}
              stroke={colors[0]}
              strokeWidth={1}
            />
            
            {data.some(item => item.comparison !== undefined) && (
              <Bar 
                dataKey="comparison" 
                fill="url(#barGradient2)"
                radius={[4, 4, 0, 0]}
                stroke={colors[1]}
                strokeWidth={1}
              />
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DashboardBarChart;