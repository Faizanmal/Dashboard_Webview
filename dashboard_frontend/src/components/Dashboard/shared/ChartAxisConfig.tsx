import { XAxis as RechartsXAxis, YAxis as RechartsYAxis } from 'recharts';
import { CHART_STYLES } from '@/constants/dashboards';

// Common axis configuration props to reduce duplication across chart components
const COMMON_AXIS_PROPS = {
  axisLine: false,
  tickLine: false,
  tick: { fill: CHART_STYLES.axis, fontSize: 12 },
};

interface XAxisProps {
  dataKey: string;
}

export const XAxis = ({ dataKey }: XAxisProps) => (
  <RechartsXAxis 
    dataKey={dataKey}
    {...COMMON_AXIS_PROPS}
    dy={10}
  />
);

export const YAxis = () => (
  <RechartsYAxis 
    {...COMMON_AXIS_PROPS}
    dx={-10}
  />
);
