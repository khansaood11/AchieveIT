
'use client';

import { ActivityCharts } from './activity-charts';
import { MetricCard } from './metric-card';
import { HeightIcon } from '../icons/height-icon';
import { Weight, HeartPulse, Footprints, Loader2, RefreshCw, Flame } from 'lucide-react';
import { BloodPressureIcon } from '../icons/blood-pressure-icon';
import { useAuth } from '@/hooks/use-auth';
import { useCallback, useEffect, useState } from 'react';
import type { ActivityData, HealthMetrics } from '@/lib/types';
import { Card } from '../ui/card';
import { Button } from '../ui/button';

const initialMetrics: HealthMetrics = {
  height: 0,
  weight: 0,
  bloodPressure: { systolic: 0, diastolic: 0 },
  stepCount: 0,
  heartRate: 0,
  calories: 0,
};

const initialActivityData: ActivityData = {
    steps: [],
    glucose: [],
    bodyFat: [],
};

export const HealthDashboard = () => {
    const { fitToken } = useAuth();
    const [metrics, setMetrics] = useState<HealthMetrics>(initialMetrics);
    const [activityData, setActivityData] = useState<ActivityData>(initialActivityData);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async (token: string) => {
        setIsLoading(true);
        setError(null);
        setMetrics(initialMetrics);
        try {
            const now = new Date();
            const startTime = new Date();
            startTime.setDate(now.getDate() - 6); // Last 7 days
            startTime.setHours(0, 0, 0, 0);

            const endTime = now.getTime();
            
            const aggregateRequest = {
                aggregateBy: [
                    { dataTypeName: 'com.google.step_count.delta' },
                    { dataTypeName: 'com.google.blood_glucose' },
                    { dataTypeName: 'com.google.body.fat.percentage' },
                ],
                bucketByTime: { durationMillis: 86400000 }, // Daily buckets
                startTimeMillis: startTime.getTime(),
                endTimeMillis: endTime,
            };

            const response = await fetch('https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(aggregateRequest)
            });

            if (!response.ok) {
                 const errorData = await response.json();
                 console.error('Google Fit Aggregate API Error:', errorData);
                 throw new Error('Failed to fetch aggregate activity data. Please re-connect Google Fit.');
            }
            const result = await response.json();
            
            const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const steps = result.bucket.map((bucket: any, index: number) => {
                 const point = bucket.dataset[0].point;
                 return { name: weekDays[(new Date(parseInt(bucket.startTimeMillis, 10))).getDay()], steps: point.length > 0 ? point[0].value[0].intVal : 0 };
            });
            
            const glucose = result.bucket.map((bucket: any, index: number) => {
                 const point = bucket.dataset[1].point;
                 return { name: weekDays[(new Date(parseInt(bucket.startTimeMillis, 10))).getDay()], level: point.length > 0 ? point[0].value[0].fpVal : 0 };
            });

            const bodyFat = result.bucket.map((bucket: any, index: number) => {
                 const point = bucket.dataset[2].point;
                 return { name: weekDays[(new Date(parseInt(bucket.startTimeMillis, 10))).getDay()], percent: point.length > 0 ? point[0].value[0].fpVal : 0 };
            });
            
            setActivityData({ steps, glucose, bodyFat });
            setMetrics(prev => ({...prev, stepCount: steps.findLast((s: any) => s.steps > 0)?.steps ?? 0}));


            const dataSources = [
                { name: 'height', sourceId: 'derived:com.google.height:com.google.android.gms:merge_height' },
                { name: 'weight', sourceId: 'derived:com.google.weight:com.google.android.gms:merge_weight' },
                { name: 'blood_pressure', sourceId: 'derived:com.google.blood_pressure:com.google.android.gms:merged' },
                { name: 'heart_rate', sourceId: 'derived:com.google.heart_rate.bpm:com.google.android.gms:merge_heart_rate_bpm' },
                { name: 'calories', sourceId: 'derived:com.google.calories.expended:com.google.android.gms:merge_calories_expended'},
            ];
            
            for (const ds of dataSources) {
                try {
                    const dsResponse = await fetch(`https://www.googleapis.com/fitness/v1/users/me/dataSources/${ds.sourceId}/datasets/0-${endTime}000000`, {
                         headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (dsResponse.ok) {
                        const dsResult = await dsResponse.json();
                        if (dsResult.point && dsResult.point.length > 0) {
                            const latestPoint = dsResult.point[dsResult.point.length - 1].value[0];
                            if (ds.name === 'height') setMetrics(prev => ({ ...prev, height: latestPoint.fpVal ? (latestPoint.fpVal * 100).toFixed(0) : prev.height }));
                            if (ds.name === 'weight') setMetrics(prev => ({ ...prev, weight: latestPoint.fpVal ? latestPoint.fpVal.toFixed(1) : prev.weight }));
                            if (ds.name === 'heart_rate') setMetrics(prev => ({ ...prev, heartRate: latestPoint.fpVal ? latestPoint.fpVal.toFixed(0) : prev.heartRate }));
                            if (ds.name === 'calories') setMetrics(prev => ({ ...prev, calories: latestPoint.fpVal ? latestPoint.fpVal.toFixed(0) : prev.calories }));
                            if (ds.name === 'blood_pressure') {
                                const bpPoint = dsResult.point[dsResult.point.length - 1].value;
                                setMetrics(prev => ({ ...prev, bloodPressure: { systolic: bpPoint[0].fpVal.toFixed(0), diastolic: bpPoint[1].fpVal.toFixed(0) } }));
                            }
                        }
                    }
                } catch(e) {
                     console.warn(`Could not fetch data for ${ds.name}:`, e);
                }
            }
        } catch (e: any) {
            console.error("Main fetch error:", e);
            setError(e.message || "An unknown error occurred while fetching health data.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (fitToken) {
            fetchData(fitToken);
        } else {
            setIsLoading(false);
        }
    }, [fitToken, fetchData]);
    
    const handleRefresh = () => {
        if (fitToken) {
            fetchData(fitToken);
        }
    }

    if (!fitToken) {
        return null;
    }
    
    if (isLoading) {
        return (
            <div>
                 <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold font-headline">Health Overview</h2>
                 </div>
                 <div className="flex items-center justify-center p-8 min-h-[200px]">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="ml-4">Loading Health Data...</p>
                </div>
            </div>
        )
    }

  return (
    <div>
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold font-headline">Health Overview</h2>
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
                <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
            </Button>
        </div>
        {error && (
            <Card className="bg-destructive/10 border-destructive text-destructive-foreground p-4 mb-4">
                <p>{error}</p>
            </Card>
        )}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <MetricCard 
                title="Height" 
                value={metrics.height?.toString() ?? 'N/A'}
                unit="cm" 
                icon={HeightIcon}
                color="text-blue-500"
            />
            <MetricCard 
                title="Weight" 
                value={metrics.weight?.toString() ?? 'N/A'}
                unit="kg" 
                icon={Weight}
                color="text-green-500"
            />
            <MetricCard 
                title="Blood Pressure" 
                value={`${metrics.bloodPressure?.systolic ?? 'N'}/${metrics.bloodPressure?.diastolic ?? 'A'}`}
                unit="mmHg" 
                icon={BloodPressureIcon}
                color="text-red-500"
            />
            <MetricCard 
                title="Step Count" 
                value={metrics.stepCount?.toLocaleString() ?? 'N/A'}
                unit="today" 
                icon={Footprints}
                color="text-pink-500"
            />
            <MetricCard 
                title="Heart Rate" 
                value={metrics.heartRate?.toString() ?? 'N/A'}
                unit="bpm" 
                icon={HeartPulse}
                color="text-purple-500"
            />
             <MetricCard 
                title="Calories Burned" 
                value={metrics.calories?.toLocaleString() ?? 'N/A'}
                unit="kcal" 
                icon={Flame}
                color="text-orange-500"
            />
        </div>

        <div className="mt-8">
            <h3 className="text-xl font-bold font-headline mb-4">Weekly Activity</h3>
            <ActivityCharts data={activityData} />
        </div>
    </div>
  );
};
