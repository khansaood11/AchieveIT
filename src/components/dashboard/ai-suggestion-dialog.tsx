'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { getAiSuggestions } from '@/lib/actions';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Loader2 } from 'lucide-react';
import type { SuggestGoalOutput } from '@/ai/flows/ai-goal-suggestion';

const suggestionSchema = z.object({
  currentGoals: z.string().min(10, 'Please describe your current goals.'),
  pastPerformance: z.string().min(10, 'Please describe your past performance.'),
});

type SuggestionFormData = z.infer<typeof suggestionSchema>;

interface AiSuggestionDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export const AiSuggestionDialog: React.FC<AiSuggestionDialogProps> = ({ isOpen, onOpenChange }) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<SuggestGoalOutput | null>(null);

  const form = useForm<SuggestionFormData>({
    resolver: zodResolver(suggestionSchema),
    defaultValues: {
      currentGoals: '',
      pastPerformance: '',
    },
  });

  const handleSubmit = async (data: SuggestionFormData) => {
    setIsLoading(true);
    setSuggestion(null);
    const result = await getAiSuggestions(data);
    setIsLoading(false);
    
    if (result.success && result.data) {
      setSuggestion(result.data);
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.error,
      });
    }
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      form.reset();
      setSuggestion(null);
    }
    onOpenChange(open);
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-headline">AI-Powered Goal Suggestions</DialogTitle>
          <DialogDescription>Let AI help you set realistic and achievable goals based on your progress.</DialogDescription>
        </DialogHeader>

        {!suggestion && !isLoading && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="currentGoals"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Current Goals</FormLabel>
                    <FormControl>
                      <Textarea placeholder="e.g., I'm trying to learn guitar and save for a vacation." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="pastPerformance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Past Performance</FormLabel>
                    <FormControl>
                      <Textarea placeholder="e.g., I practiced guitar twice last week but haven't saved much money yet." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Get Suggestions
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}

        {isLoading && (
            <div className="flex items-center justify-center p-8 min-h-[200px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-4">Generating suggestions...</p>
            </div>
        )}

        {suggestion && (
          <div className="space-y-4 max-h-[60vh] overflow-y-auto p-1">
            <Card>
              <CardHeader>
                <CardTitle className='font-headline'>AI Suggestions</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
                {suggestion}
              </CardContent>
            </Card>
             <DialogFooter>
                <Button onClick={() => setSuggestion(null)}>Ask Again</Button>
              </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
