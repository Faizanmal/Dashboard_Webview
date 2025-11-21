import { LineChart, Line, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CHART_COLORS, CHART_MARGINS, CHART_STYLES, type LineChartData } from '@/constants/dashboards';
import { ChartTooltip } from './shared/ChartToolTip';
import { XAxis, YAxis } from './shared/ChartAxisConfig';
import { ChartHeader } from './shared/ChartHeader';

interface DashboardLineChartProps {
  data: LineChartData[];
  title: string;
  color?: string;
}

const DashboardLineChart = ({ data, title, color = CHART_COLORS.primary }: DashboardLineChartProps) => {
  return (
    <div className={CHART_STYLES.container}>
      <ChartHeader title={title} dividerStyle="primary" />
      
      <div className={CHART_STYLES.chartHeight}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={CHART_MARGINS}>
            <defs>
              <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={color} stopOpacity={0}/>
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
            
            <Line
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={3}
              dot={{ fill: color, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: color, strokeWidth: 2, fill: 'white' }}
              fill="url(#lineGradient)"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DashboardLineChart;