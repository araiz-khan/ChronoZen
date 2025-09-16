'use client';

import { useState, type ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Task } from '@/lib/types';
import { getTaskSuggestion } from '@/app/actions';

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2, Wand2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const taskSchema = z.object({
  title: z.string().min(1, 'Task description is required.'),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format. Use HH:mm.'),
  duration: z.coerce.number().min(1, 'Duration must be at least 1 minute.'),
});

interface AddTaskDialogProps {
  children: ReactNode;
  onAddTask: (task: Omit<Task, 'id' | 'isCompleted'>) => void;
  allTasks: Task[];
}

export function AddTaskDialog({ children, onAddTask, allTasks }: AddTaskDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof taskSchema>>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '',
      startTime: '',
      duration: 30,
    },
  });
  
  const scheduleNotification = (taskTitle: string, taskStartTime: string) => {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      return;
    }
  
    const [hours, minutes] = taskStartTime.split(':').map(Number);
    const now = new Date();
    const taskTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);
  
    if (taskTime > now) {
      const timeout = taskTime.getTime() - now.getTime();
      setTimeout(() => {
        new Notification('ChronoZen Reminder', {
          body: `Your task "${taskTitle}" is starting now.`,
          icon: '/favicon.ico'
        });
      }, timeout);
    }
  };

  const onSubmit = (values: z.infer<typeof taskSchema>) => {
    onAddTask(values);
    scheduleNotification(values.title, values.startTime);
    toast({ title: 'Task Added', description: `"${values.title}" has been added to your schedule.` });
    form.reset({ title: '', startTime: '', duration: 30 });
    setOpen(false);
  };
  
  const handleSuggestion = async () => {
    const { title, duration } = form.getValues();
    if (!title || !duration || duration < 1) {
      toast({ variant: 'destructive', title: 'Missing Info', description: 'Please provide a task description and a valid duration to get a suggestion.' });
      return;
    }

    setIsSuggesting(true);
    const result = await getTaskSuggestion({
      taskDescription: title,
      taskDurationMinutes: duration,
      historicalScheduleData: JSON.stringify(allTasks),
    });
    setIsSuggesting(false);

    if (result.success && result.data) {
      const suggestedDate = new Date(result.data.suggestedTiming);
      const hours = suggestedDate.getHours().toString().padStart(2, '0');
      const minutes = suggestedDate.getMinutes().toString().padStart(2, '0');
      form.setValue('startTime', `${hours}:${minutes}`);
      toast({
        title: 'AI Suggestion ✨',
        description: `We suggest starting at ${hours}:${minutes}. ${result.data.reasoning}`,
        duration: 9000
      });
    } else {
      toast({ variant: 'destructive', title: 'AI Error', description: result.error || 'Could not get a suggestion.' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Task</DialogTitle>
          <DialogDescription>
            Fill in the details for your new task. You can also ask our AI to suggest the best time.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Task</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Team meeting" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
               <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (min)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="30" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <Button type="button" variant="outline" className="w-full" onClick={handleSuggestion} disabled={isSuggesting}>
              {isSuggesting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Wand2 className="mr-2 h-4 w-4" />
              )}
              Suggest a Time with AI
            </Button>
            
            <DialogFooter className="pt-4">
              <DialogClose asChild>
                <Button type="button" variant="ghost">Cancel</Button>
              </DialogClose>
              <Button type="submit">Add Task</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
