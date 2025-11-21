import { CHART_STYLES } from '@/constants/dashboards';

interface ChartHeaderProps {
  title: string;
  dividerStyle?: 'primary' | 'accent';
}

export const ChartHeader = ({ title, dividerStyle = 'primary' }: ChartHeaderProps) => {
  const dividerClass = dividerStyle === 'primary' 
    ? CHART_STYLES.dividerPrimary 
    : CHART_STYLES.dividerAccent;

  return (
    <div className="mb-6">
      <h3 className={CHART_STYLES.title}>{title}</h3>
      <div className={dividerClass} />
    </div>
  );
};
