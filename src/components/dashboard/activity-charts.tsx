
'use client';

import { BarChart, Bar, LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ActivityData } from '@/lib/types';
import { useMemo } from 'react';

interface ActivityChartsProps {
    data: ActivityData;
}

export const ActivityCharts: React.FC<ActivityChartsProps> = ({ data }) => {
  const hasStepData = useMemo(() => data.steps.some(d => d.steps > 0), [data.steps]);
  const hasGlucoseData = useMemo(() => data.glucose.some(d => d.level > 0), [data.glucose]);
  const hasBodyFatData = useMemo(() => data.bodyFat.some(d => d.percent > 0), [data.bodyFat]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      <Card>
        <CardHeader>
          <CardTitle>Step Count</CardTitle>
        </CardHeader>
        <CardContent>
          {hasStepData ? (
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.steps}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="steps" fill="hsl(var(--primary))" name="Steps" />
                </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                No step data found for the last 7 days.
            </div>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Glucose Level</CardTitle>
        </CardHeader>
        <CardContent>
          {hasGlucoseData ? (
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data.glucose}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={['dataMin - 10', 'dataMax + 10']} />
                <Tooltip />
                <Line type="monotone" dataKey="level" stroke="hsl(var(--chart-2))" name="mg/dL" />
                </LineChart>
            </ResponsiveContainer>
           ) : (
            <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                No glucose data found for the last 7 days.
            </div>
          )}
        </CardContent>
      </Card>
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Body Fat</CardTitle>
        </CardHeader>
        <CardContent>
          {hasBodyFatData ? (
            <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={data.bodyFat}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={['dataMin - 2', 'dataMax + 2']} />
                    <Tooltip />
                    <Area type="monotone" dataKey="percent" stroke="hsl(var(--chart-5))" fill="hsl(var(--chart-5))" fillOpacity={0.3} name="Percent" />
                </AreaChart>
            </ResponsiveContainer>
          ): (
            <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                No body fat data found for the last 7 days.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
