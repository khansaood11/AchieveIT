import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';
import type { FC, ElementType } from 'react';

interface MetricCardProps {
  title: string;
  value: string;
  unit: string;
  icon: ElementType | LucideIcon;
  color: string;
}

export const MetricCard: FC<MetricCardProps> = ({ title, value, unit, icon: Icon, color }) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={cn("h-6 w-6 text-muted-foreground", color)} />
      </CardHeader>
      <CardContent className="pt-0">
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{unit}</p>
      </CardContent>
    </Card>
  );
};
