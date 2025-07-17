
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Pencil, RefreshCw } from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import { Button } from '../ui/button';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/use-auth';
import { Popover, PopoverTrigger, PopoverContent } from '../ui/popover';
import { Input } from '../ui/input';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogTrigger } from '../ui/dialog';
import { StepStatsDialog } from './step-stats-dialog';

interface StepsCardProps {
  token: string;
}

export const StepsCard: React.FC<StepsCardProps> = ({ token }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [steps, setSteps] = useState<number | null>(null);
  const [stepGoal, setStepGoal] = useState<number>(10000);
  const [isLoading, setIsLoading] = useState(true);
  const [isGoalLoading, setIsGoalLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [newGoal, setNewGoal] = useState(stepGoal);

  const fetchSteps = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    const today = new Date();
    const startTime = new Date(today.setHours(0, 0, 0, 0)).getTime();
    const endTime = new Date(today.setHours(23, 59, 59, 999)).getTime();

    try {
      const response = await fetch('https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          aggregateBy: [{
            dataTypeName: "com.google.step_count.delta",
            dataSourceId: "derived:com.google.step_count.delta:com.google.android.gms:estimated_steps"
          }],
          bucketByTime: { durationMillis: 86400000 },
          startTimeMillis: startTime,
          endTimeMillis: endTime,
        })
      });

      if (!response.ok) {
         const errorData = await response.json();
         throw new Error(errorData.error.message || 'Failed to fetch steps data.');
      }

      const data = await response.json();
      const buckets = data.bucket;
      if (buckets && buckets.length > 0 && buckets[0].dataset[0].point.length > 0) {
          setSteps(buckets[0].dataset[0].point[0].value[0].intVal);
      } else {
          setSteps(0);
      }
    } catch (err: any) {
      console.error(err);
      setError('Could not load steps. Re-sync or check permissions.');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  const fetchStepGoal = useCallback(async () => {
      if (!user) return;
      setIsGoalLoading(true);
      const userDocRef = doc(db, `users/${user.uid}`);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists() && userDoc.data().stepGoal) {
          const goal = userDoc.data().stepGoal;
          setStepGoal(goal);
          setNewGoal(goal);
      } else {
          // Set a default if not found in DB
          await setDoc(userDocRef, { stepGoal: 10000 }, { merge: true });
          setStepGoal(10000);
          setNewGoal(10000);
      }
      setIsGoalLoading(false);
  }, [user]);

  useEffect(() => {
    fetchSteps();
    fetchStepGoal();
  }, [fetchSteps, fetchStepGoal]);

  const handleSaveGoal = async () => {
    if (!user || newGoal <= 0) return;
    setIsGoalLoading(true);
    try {
        const userDocRef = doc(db, `users/${user.uid}`);
        await setDoc(userDocRef, { stepGoal: newGoal }, { merge: true });
        setStepGoal(newGoal);
        setIsEditingGoal(false);
        toast({ title: "Goal Updated", description: `Your new daily step goal is ${newGoal.toLocaleString()}.` });
    } catch (error) {
        toast({ variant: 'destructive', title: "Error", description: "Could not update your step goal." });
    } finally {
        setIsGoalLoading(false);
    }
  };

  const progress = stepGoal > 0 ? Math.min(((steps ?? 0) / stepGoal) * 100, 100) : 0;
  const circumference = 2 * Math.PI * 52; // 2 * pi * radius
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  if (error && !isLoading) {
    return (
        <Card className="col-span-1">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="font-headline text-sm font-medium">Steps Today</CardTitle>
                <Button variant="ghost" size="icon" onClick={() => fetchSteps()} disabled={isLoading}>
                    <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                </Button>
            </CardHeader>
            <CardContent className="h-[210px] flex flex-col items-center justify-center text-center text-destructive p-4">
                <p className="text-sm">{error}</p>
            </CardContent>
        </Card>
    )
  }

  return (
    <Dialog>
        <Card className="col-span-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="font-headline text-sm font-medium">Steps Today</CardTitle>
            <div className="flex items-center gap-0">
                <Popover open={isEditingGoal} onOpenChange={setIsEditingGoal}>
                    <PopoverTrigger asChild>
                         <Button variant="ghost" size="icon">
                            <Pencil className="h-4 w-4" />
                         </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-56">
                        <div className="grid gap-4">
                            <div className="space-y-2">
                                <h4 className="font-medium leading-none">Set Step Goal</h4>
                                <p className="text-sm text-muted-foreground">Set your daily step goal.</p>
                            </div>
                            <Input 
                                type="number" 
                                value={newGoal}
                                onChange={(e) => setNewGoal(parseInt(e.target.value, 10) || 0)}
                                className="col-span-2 h-8"
                            />
                            <Button onClick={handleSaveGoal} disabled={isGoalLoading}>Save</Button>
                        </div>
                    </PopoverContent>
                </Popover>

                <Button variant="ghost" size="icon" onClick={() => fetchSteps()} disabled={isLoading}>
                    <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                </Button>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center pt-2">
            {isLoading || isGoalLoading ? (
                <div className="h-[180px] flex items-center justify-center">
                    <Skeleton className="h-[140px] w-[140px] rounded-full" />
                </div>
            ) : (
                <DialogTrigger asChild>
                    <div className="flex flex-col items-center cursor-pointer">
                        <div className="relative h-[140px] w-[140px]">
                            <svg className="w-full h-full" viewBox="0 0 120 120">
                                {/* Background circle */}
                                <circle
                                    className="text-muted/20"
                                    strokeWidth="10"
                                    stroke="currentColor"
                                    fill="transparent"
                                    r="52"
                                    cx="60"
                                    cy="60"
                                />
                                {/* Progress circle */}
                                <circle
                                    className="text-primary"
                                    strokeWidth="10"
                                    strokeDasharray={circumference}
                                    strokeDashoffset={strokeDashoffset}
                                    strokeLinecap="round"
                                    stroke="currentColor"
                                    fill="transparent"
                                    r="52"
                                    cx="60"
                                    cy="60"
                                    style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%', transition: 'stroke-dashoffset 0.5s ease-out' }}
                                />
                            </svg>
                            <div className="absolute top-0 left-0 flex h-full w-full flex-col items-center justify-center">
                                <span className="text-3xl font-bold text-foreground">{steps?.toLocaleString() ?? '0'}</span>
                                <span className="text-sm text-muted-foreground">/ {stepGoal.toLocaleString()}</span>
                            </div>
                        </div>
                        <CardDescription className="mt-4 text-center">
                            {Math.round(progress)}% of Goal
                        </CardDescription>
                    </div>
                </DialogTrigger>
            )}
          </CardContent>
        </Card>
        <StepStatsDialog token={token} />
    </Dialog>
  );
};
