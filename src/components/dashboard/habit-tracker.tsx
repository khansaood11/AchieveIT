
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import type { Habit } from '@/lib/types';
import { getDay } from 'date-fns';

interface HabitTrackerProps {
  habits: Habit[];
  onHabitChange: (habitId: string, dayIndex: number, isCompleted: boolean) => void;
}

const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export const HabitTracker: React.FC<HabitTrackerProps> = ({ habits, onHabitChange }) => {
  const todayIndex = getDay(new Date());

  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader>
        <CardTitle className="font-headline">Habit Tracker</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {habits.map((habit) => (
          <div key={habit.id} className="p-3 rounded-md border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <p className="font-medium mr-auto">{habit.name}</p>
            <div className="flex gap-2 sm:gap-3 items-center">
              {weekDays.map((day, index) => (
                 <div key={index} className="flex flex-col items-center gap-1">
                   <label htmlFor={`${habit.id}-${index}`} className={`text-xs text-muted-foreground ${index === todayIndex ? 'font-bold text-primary' : ''}`}>{day}</label>
                   <Checkbox
                     id={`${habit.id}-${index}`}
                     checked={habit.completedDays[index]}
                     onCheckedChange={(checked) => onHabitChange(habit.id, index, !!checked)}
                   />
                 </div>
              ))}
            </div>
          </div>
        ))}
        {habits.length === 0 && (
          <p className="text-muted-foreground text-center">No habits added yet. Start building good habits today!</p>
        )}
      </CardContent>
    </Card>
  );
};
