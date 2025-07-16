'use client';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import type { Goal, GoalTemplate } from '@/lib/types';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { CalendarIcon } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Card } from '../ui/card';
import { ScrollArea } from '../ui/scroll-area';

const goalSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters long.'),
  description: z.string().optional(),
  category: z.enum(['Personal', 'Work', 'Health', 'Finance', 'Education']),
  priority: z.enum(['Low', 'Medium', 'High']),
  dueDate: z.date().optional(),
});

type GoalFormData = z.infer<typeof goalSchema>;

interface AddGoalDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSave: (goal: Omit<Goal, 'progress' | 'isCompleted' | 'createdAt'> & { id?: string }) => void;
  goalToEdit: Goal | null;
}

const templates: GoalTemplate[] = [
    { title: 'Read 12 Books This Year', description: 'Read one book every month to expand knowledge.', category: 'Personal' },
    { title: 'Learn a New Skill for Work', description: 'Complete an online course related to my career.', category: 'Work' },
    { title: 'Exercise 3 Times a Week', description: 'Go to the gym or do home workouts on Monday, Wednesday, and Friday.', category: 'Health' },
    { title: 'Save $1000 for Emergency Fund', description: 'Set aside money from each paycheck for the emergency fund.', category: 'Finance' },
];


export const AddGoalDialog: React.FC<AddGoalDialogProps> = ({ isOpen, onOpenChange, onSave, goalToEdit }) => {
  const { toast } = useToast();
  const form = useForm<GoalFormData>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      title: '',
      description: '',
      category: 'Personal',
      priority: 'Medium',
      dueDate: undefined,
    },
  });

  useEffect(() => {
    if (goalToEdit && isOpen) {
      form.reset({
        title: goalToEdit.title,
        description: goalToEdit.description,
        category: goalToEdit.category,
        priority: goalToEdit.priority,
        // Firestore timestamps need to be converted to Date objects
        dueDate: goalToEdit.dueDate?.toDate ? goalToEdit.dueDate.toDate() : goalToEdit.dueDate,
      });
    } else {
      form.reset({
        title: '',
        description: '',
        category: 'Personal',
        priority: 'Medium',
        dueDate: undefined,
      });
    }
  }, [goalToEdit, isOpen, form]);

  const handleSave = (data: GoalFormData) => {
    onSave({ id: goalToEdit?.id, ...data });
    onOpenChange(false);
    toast({
      title: `Goal ${goalToEdit ? 'updated' : 'created'}!`,
      description: `Your goal "${data.title}" has been saved.`,
    });
  };
  
  const applyTemplate = (template: GoalTemplate) => {
    form.setValue('title', template.title);
    form.setValue('description', template.description);
    form.setValue('category', template.category);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] grid-cols-1 md:grid-cols-2">
        <div>
          <DialogHeader>
            <DialogTitle className="font-headline">{goalToEdit ? 'Edit Goal' : 'Create a New Goal'}</DialogTitle>
            <DialogDescription>Fill in the details for your goal. A well-defined goal is the first step to success.</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSave)} className="space-y-4 py-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Goal Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Run a 5k marathon" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Add more details about your goal..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Personal">Personal</SelectItem>
                          <SelectItem value="Work">Work</SelectItem>
                          <SelectItem value="Health">Health</SelectItem>
                          <SelectItem value="Finance">Finance</SelectItem>
                          <SelectItem value="Education">Education</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a priority" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Low">Low</SelectItem>
                          <SelectItem value="Medium">Medium</SelectItem>
                          <SelectItem value="High">High</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Due Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button variant="outline" className={cn('w-full pl-3 text-left font-normal', !field.value && 'text-muted-foreground')}>
                            {field.value ? new Date(field.value).toLocaleDateString() : <span>Pick a date</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit">{goalToEdit ? 'Save Changes' : 'Create Goal'}</Button>
              </DialogFooter>
            </form>
          </Form>
        </div>
        <div className="hidden md:flex flex-col">
            <DialogHeader>
                <DialogTitle className="font-headline">Goal Templates</DialogTitle>
                <DialogDescription>Or get started with a template.</DialogDescription>
            </DialogHeader>
            <ScrollArea className="h-[400px] mt-4 pr-4">
                <div className="space-y-2">
                    {templates.map((template) => (
                        <Card key={template.title} className="p-3 hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => applyTemplate(template)}>
                            <p className="font-semibold">{template.title}</p>
                            <p className="text-sm text-muted-foreground">{template.description}</p>
                        </Card>
                    ))}
                </div>
            </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};
