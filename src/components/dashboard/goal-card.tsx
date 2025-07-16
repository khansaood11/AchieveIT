'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Progress } from '@/components/ui/progress';
import type { Goal } from '@/lib/types';
import { Calendar, CheckCircle, Edit, MoreVertical, Trash2 } from 'lucide-react';
import { Button } from '../ui/button';

interface GoalCardProps {
  goal: Goal;
  onEdit: (goal: Goal) => void;
  onDelete: (goalId: string) => void;
  onToggleComplete: (goal: Goal) => void;
}

export const GoalCard: React.FC<GoalCardProps> = ({ goal, onEdit, onDelete, onToggleComplete }) => {
  const priorityVariant = {
    High: 'destructive',
    Medium: 'secondary',
    Low: 'outline',
  } as const;

  const getDueDate = () => {
    if (!goal.dueDate) return null;
    // Firestore Timestamps have a toDate() method
    if (goal.dueDate.toDate) {
      return goal.dueDate.toDate().toLocaleDateString();
    }
    // Handle JS Date objects
    return new Date(goal.dueDate).toLocaleDateString();
  };

  return (
    <Card className={`flex flex-col ${goal.isCompleted ? 'bg-muted/50' : ''}`}>
      <CardHeader className="flex-row items-start justify-between">
        <div>
          <CardTitle className="font-headline text-lg">{goal.title}</CardTitle>
          <CardDescription>{goal.category}</CardDescription>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(goal)}>
              <Edit className="mr-2 h-4 w-4" />
              <span>Edit</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onToggleComplete(goal)}>
              <CheckCircle className="mr-2 h-4 w-4" />
              <span>{goal.isCompleted ? 'Mark as Incomplete' : 'Mark as Complete'}</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete(goal.id)} className="text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              <span>Delete</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground">{goal.description}</p>
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-4">
        <div className="w-full">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium">Progress</span>
            <span className="text-sm font-bold text-primary">{goal.progress}%</span>
          </div>
          <Progress value={goal.progress} aria-label={`${goal.progress}% complete`} />
        </div>
        <div className="flex justify-between items-center w-full">
          <Badge variant={priorityVariant[goal.priority]}>{goal.priority} Priority</Badge>
          {goal.dueDate && (
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="mr-2 h-4 w-4" />
              <span>{getDueDate()}</span>
            </div>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};
