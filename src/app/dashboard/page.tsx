
'use client';

import { AddGoalDialog } from '@/components/dashboard/add-goal-dialog';
import { AiSuggestionDialog } from '@/components/dashboard/ai-suggestion-dialog';
import { GoalCard } from '@/components/dashboard/goal-card';
import { HabitTracker } from '@/components/dashboard/habit-tracker';
import { Header } from '@/components/dashboard/header';
import { MotivationalQuote } from '@/components/dashboard/motivational-quote';
import { ProgressCharts } from '@/components/dashboard/progress-charts';
import { CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import type { Goal, Habit } from '@/lib/types';
import { collection, deleteDoc, doc, onSnapshot, orderBy, query, setDoc, updateDoc } from 'firebase/firestore';
import { CheckCircle, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { HealthDashboard } from '@/components/dashboard/health-dashboard';

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const [goals, setGoals] = useState<Goal[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [goalsLoading, setGoalsLoading] = useState(true);
  const [habitsLoading, setHabitsLoading] = useState(true);

  const [isAddGoalOpen, setAddGoalOpen] = useState(false);
  const [isAiSuggestOpen, setAiSuggestOpen] = useState(false);
  const [goalToEdit, setGoalToEdit] = useState<Goal | null>(null);

  useEffect(() => {
    if (authLoading) {
      // Don't do anything while auth state is resolving
      return;
    }
    if (!user) {
      // AuthProvider will handle redirect
      return;
    };

    setGoalsLoading(true);
    setHabitsLoading(true);

    const goalsQuery = query(collection(db, `users/${user.uid}/goals`), orderBy('createdAt', 'desc'));
    const habitsQuery = query(collection(db, `users/${user.uid}/habits`));

    const unsubscribeGoals = onSnapshot(goalsQuery, (snapshot) => {
      const goalsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Goal));
      setGoals(goalsData);
      setGoalsLoading(false);
    }, (error) => {
      console.error("Error fetching goals:", error);
      toast({ variant: "destructive", title: "Error", description: "Could not fetch goals." });
      setGoalsLoading(false);
    });

    const unsubscribeHabits = onSnapshot(habitsQuery, (snapshot) => {
        const habitsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Habit));
        setHabits(habitsData);
        setHabitsLoading(false);

        if (habitsData.length === 0 && !snapshot.metadata.hasPendingWrites) {
            // Create default habits if none exist
            const defaultHabits: Omit<Habit, 'id'>[] = [
                { name: 'Drink 8 glasses of water', completedDays: Array(7).fill(false) },
                { name: 'Read for 15 minutes', completedDays: Array(7).fill(false) },
            ];
            defaultHabits.forEach(async (habit) => {
                const newHabitRef = doc(collection(db, `users/${user.uid}/habits`));
                await setDoc(newHabitRef, { ...habit, id: newHabitRef.id });
            });
        }
    }, (error) => {
        console.error("Error fetching habits:", error);
        toast({ variant: "destructive", title: "Error", description: "Could not fetch habits." });
        setHabitsLoading(false);
    });

    return () => {
        unsubscribeGoals();
        unsubscribeHabits();
    };
  }, [user, authLoading, toast]);


  const handleOpenAddGoal = (goal: Goal | null = null) => {
    setGoalToEdit(goal);
    setAddGoalOpen(true);
  };

  const handleSaveGoal = async (goalData: Omit<Goal, 'progress' | 'isCompleted' | 'createdAt'>) => {
    if (!user) return;
    try {
      if (goalData.id) {
        const goalRef = doc(db, `users/${user.uid}/goals`, goalData.id);
        await updateDoc(goalRef, { ...goalData });
      } else {
        const newGoalRef = doc(collection(db, `users/${user.uid}/goals`));
        const newGoal: Goal = {
          ...goalData,
          id: newGoalRef.id,
          progress: 0,
          isCompleted: false,
          createdAt: new Date()
        };
        await setDoc(newGoalRef, newGoal);
      }
    } catch (error) {
        console.error("Error saving goal:", error);
        toast({ variant: "destructive", title: "Error", description: "Could not save the goal."});
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, `users/${user.uid}/goals`, goalId));
      toast({ title: 'Goal Deleted', description: 'The goal has been removed.' });
    } catch (error) {
        toast({ variant: "destructive", title: "Error", description: "Could not delete the goal."});
    }
  };
  
  const handleToggleComplete = async (goal: Goal) => {
    if (!user) return;
    try {
        const isNowCompleted = !goal.isCompleted;
        const newProgress = isNowCompleted ? 100 : goal.progress < 100 ? goal.progress : 90;
        await updateDoc(doc(db, `users/${user.uid}/goals`, goal.id), { 
            isCompleted: isNowCompleted,
            progress: newProgress
        });
        if (isNowCompleted) {
            toast({
                title: 'Milestone Achieved!',
                description: `You've completed your goal: "${goal.title}"`,
                action: <CheckCircle className="text-green-500" />,
            });
        }
    } catch(error) {
         toast({ variant: "destructive", title: "Error", description: "Could not update the goal."});
    }
  };

  const handleHabitChange = async (habitId: string, dayIndex: number, isCompleted: boolean) => {
    if (!user) return;
    const habitToUpdate = habits.find(h => h.id === habitId);
    if (!habitToUpdate) return;
    
    const newCompletedDays = [...habitToUpdate.completedDays];
    newCompletedDays[dayIndex] = isCompleted;

    try {
        await updateDoc(doc(db, `users/${user.uid}/habits`, habitId), { completedDays: newCompletedDays });
    } catch (error) {
        toast({ variant: "destructive", title: "Error", description: "Could not update habit."});
    }
  };
  
  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  const inProgressGoals = goals.filter(g => !g.isCompleted);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        <div className="bg-card shadow-lg rounded-lg">
          <Header onAddGoal={() => handleOpenAddGoal()} onAiSuggest={() => setAiSuggestOpen(true)} />
          <main className="p-4 md:p-6 space-y-8">
            
            <HealthDashboard />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-6">
                    <MotivationalQuote />
                    {goalsLoading ? <Skeleton className="h-80 w-full" /> : <ProgressCharts goals={goals} />}
                </div>
                <div className="lg:col-span-2">
                     <HabitTracker habits={habits} onHabitChange={handleHabitChange} isLoading={habitsLoading} />
                </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold font-headline mb-4">Your Goals</h2>
              {goalsLoading ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    <Skeleton className="h-64" />
                    <Skeleton className="h-64" />
                    <Skeleton className="h-64" />
                 </div>
              ) : inProgressGoals.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {inProgressGoals.map((goal) => (
                    <GoalCard 
                      key={goal.id} 
                      goal={goal} 
                      onEdit={handleOpenAddGoal} 
                      onDelete={handleDeleteGoal}
                      onToggleComplete={() => handleToggleComplete(goal)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 border-2 border-dashed rounded-lg">
                  <p className="text-muted-foreground">You have no active goals. Click "Add New Goal" to start!</p>
                </div>
              )}
            </div>
            
            { !goalsLoading && goals.some(g => g.isCompleted) && (
              <div>
                <h2 className="text-2xl font-bold font-headline mt-8 mb-4">Completed Goals</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {goals.filter(g => g.isCompleted).map((goal) => (
                      <GoalCard 
                        key={goal.id} 
                        goal={goal} 
                        onEdit={handleOpenAddGoal} 
                        onDelete={handleDeleteGoal}
                        onToggleComplete={() => handleToggleComplete(goal)}
                      />
                    ))}
                  </div>
              </div>
            )}
            
          </main>
          <CardFooter className="flex flex-col md:flex-row items-center justify-between text-center text-muted-foreground text-sm p-6 border-t gap-4">
            <div className="flex flex-col items-center">
                <Image
                    src="/gtu-logo.png"
                    alt="GTU Logo"
                    width={60}
                    height={60}
                    data-ai-hint="university logo"
                    className="rounded-full"
                />
                <p className="text-xs mt-2">Gujarat Technological University</p>
            </div>
            <div className="text-center text-xs md:text-sm">
              <p className="font-semibold text-foreground">A Design Engineering Project</p>
              <p>Varude Dhiraj, Patil Aratiben, Chaudhary Abdullah, Jibhai Mahmad Salim, & Khan Saood Ahemd</p>
              <p className="mt-2 text-xs">Guided by Prof. Mrs. Tanvi Patel | Prime Institute of Engineering and Technology | 2024-2025</p>
            </div>
            <div className="flex flex-col items-center">
                 <Image
                    src="/prime-logo.png"
                    alt="Prime College Logo"
                    width={60}
                    height={60}
                    data-ai-hint="college logo"
                    className="rounded-full"
                />
                <p className="text-xs mt-2">Prime Institute of Engineering and Technology</p>
            </div>
          </CardFooter>
        </div>
      </div>
      <AddGoalDialog 
        isOpen={isAddGoalOpen} 
        onOpenChange={setAddGoalOpen} 
        onSave={handleSaveGoal} 
        goalToEdit={goalToEdit} 
      />
      <AiSuggestionDialog
        isOpen={isAiSuggestOpen}
        onOpenChange={setAiSuggestOpen}
      />
    </div>
  );
}
