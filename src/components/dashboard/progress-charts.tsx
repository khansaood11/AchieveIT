
'use client';

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Goal } from '@/lib/types';

interface ProgressChartsProps {
  goals: Goal[];
}

export const ProgressCharts: React.FC<ProgressChartsProps> = ({ goals }) => {
  const completedGoals = goals.filter(g => g.isCompleted).length;
  const inProgressGoals = goals.length - completedGoals;

  const data = [
    { name: 'In Progress', value: inProgressGoals, fill: 'hsl(var(--primary-foreground))' },
    { name: 'Completed', value: completedGoals, fill: 'hsl(var(--primary))' },
  ];
  
  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle className="font-headline">Progress Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data} layout="vertical" margin={{ left: 10, right: 10, top: 10, bottom: 10 }}>
            <XAxis type="number" hide />
            <YAxis type="category" dataKey="name" stroke="hsl(var(--foreground))" tickLine={false} axisLine={false} width={80} />
            <Tooltip
              cursor={{ fill: 'hsl(var(--muted))' }}
              contentStyle={{
                background: 'hsl(var(--card))',
                borderColor: 'hsl(var(--border))',
                borderRadius: 'var(--radius)',
              }}
              formatter={(value: number) => [`${value} goals`, null]}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={35} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
