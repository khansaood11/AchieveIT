
'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/use-auth';
import { Footprints, Heart, Loader2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

interface FitSummaryCardProps {
  token: string;
}

interface FitData {
    steps: number;
    heartPoints: number;
    calories: number;
    distance: number;
    moveMinutes: number;
}

const dataSources = {
    steps: 'derived:com.google.step_count.delta:com.google.android.gms:aggregated',
    heartPoints: 'derived:com.google.heart.points:com.google.android.gms:aggregated',
    calories: 'derived:com.google.calories.expended:com.google.android.gms:aggregated',
    distance: 'derived:com.google.distance.delta:com.google.android.gms:aggregated',
    moveMinutes: 'derived:com.google.active_minutes:com.google.android.gms:aggregated',
};

export const FitSummaryCard: React.FC<FitSummaryCardProps> = ({ token }) => {
  const { user } = useAuth();
  const [data, setData] = useState<FitData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFitData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const now = new Date();
    const startTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0).getTime();
    const endTime = now.getTime();
    
    try {
        const requestBody = {
            aggregateBy: Object.values(dataSources).map(dataTypeName => ({ dataTypeName })),
            startTimeMillis: startTime,
            endTimeMillis: endTime,
        };
        
        const response = await fetch('https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error.message || 'Failed to fetch Google Fit data.');
        }

        const result = await response.json();
        const buckets = result.bucket;

        const getVal = (bucketIndex: number): number => {
          const dataset = buckets?.[0]?.dataset?.[bucketIndex];
          if(dataset?.point?.length > 0) {
            const point = dataset.point[0];
            return point.value[0].fpVal ?? point.value[0].intVal ?? 0;
          }
          return 0;
        }

        setData({
            steps: Math.round(getVal(0)),
            heartPoints: Math.round(getVal(1)),
            calories: Math.round(getVal(2)),
            distance: getVal(3), // in meters
            moveMinutes: Math.round(getVal(4)),
        });

    } catch (err: any) {
      console.error(err);
      setError('Could not load activity data. Please check permissions or try re-connecting.');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchFitData();
  }, [fetchFitData]);

  if (isLoading) {
      return (
          <Card className="w-full h-full min-h-[300px] flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </Card>
      )
  }

  if (error) {
      return (
          <Card className="w-full h-full min-h-[300px] flex items-center justify-center text-center p-4">
              <p className="text-destructive">{error}</p>
          </Card>
      )
  }

  const heartPointsGoal = 150; // WHO recommendation per week, so ~22 per day
  const stepsGoal = 10000;
  
  const heartPointsProgress = data ? Math.min((data.heartPoints / heartPointsGoal) * 100, 100) : 0;
  const stepsProgress = data ? Math.min((data.steps / stepsGoal) * 100, 100) : 0;
  const circumference = 2 * Math.PI * 52;

  return (
    <Card className="w-full bg-[#202124] text-white p-6 rounded-xl h-full">
      <CardContent className="flex flex-col items-center justify-center h-full p-0">
        <div className="relative w-40 h-40 md:w-48 md:h-48 mb-6">
          {/* Outer Ring - Steps */}
          <svg className="w-full h-full" viewBox="0 0 120 120" style={{ transform: 'rotate(-90deg)'}}>
              <circle cx="60" cy="60" r="52" fill="none" stroke="#4a536b" strokeWidth="8"/>
              <circle cx="60" cy="60" r="52" fill="none" stroke="#4285F4" strokeWidth="8"
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference - (stepsProgress / 100) * circumference}
                  strokeLinecap="round"
              />
          </svg>
           {/* Inner Ring - Heart Points */}
          <svg className="absolute top-0 left-0 w-full h-full" viewBox="0 0 120 120" style={{ transform: 'rotate(-90deg) scale(0.75)'}}>
              <circle cx="60" cy="60" r="52" fill="none" stroke="#4a536b" strokeWidth="10"/>
              <circle cx="60" cy="60" r="52" fill="none" stroke="#34A853" strokeWidth="10"
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference - (heartPointsProgress / 100) * circumference}
                  strokeLinecap="round"
              />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
             <div className="flex items-center text-3xl md:text-5xl font-bold">
                 <span className="text-2xl md:text-3xl text-green-400 mr-1">{data?.heartPoints ?? 0}</span>
                 <span className="text-gray-400">/</span>
                 <span className="text-2xl md:text-3xl text-blue-400 ml-1">{Math.round((data?.steps ?? 0) / 1000)}k</span>
             </div>
             <div className="text-xs text-gray-400">Heart Pts / Steps</div>
          </div>
        </div>
        
        <div className="flex items-center justify-center gap-4 md:gap-6 mb-8 text-base md:text-lg font-medium">
            <div className="flex items-center gap-2">
                <Heart className="text-green-400" size={20} />
                <span>Heart Pts</span>
            </div>
            <div className="flex items-center gap-2">
                <Footprints className="text-blue-400" size={20} />
                <span>Steps</span>
            </div>
        </div>

        <div className="grid grid-cols-3 gap-4 md:gap-8 text-center w-full max-w-sm">
            <div>
                <p className="text-xl md:text-2xl font-bold">{data?.calories ?? 0}</p>
                <p className="text-sm text-gray-400">Cal</p>
            </div>
            <div>
                 <p className="text-xl md:text-2xl font-bold">{((data?.distance ?? 0) / 1000).toFixed(2)}</p>
                <p className="text-sm text-gray-400">km</p>
            </div>
             <div>
                <p className="text-xl md:text-2xl font-bold">{data?.moveMinutes ?? 0}</p>
                <p className="text-sm text-gray-400">Move Min</p>
            </div>
        </div>
      </CardContent>
    </Card>
  );
};
