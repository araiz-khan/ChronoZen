'use client';

import type { Task } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Trash2, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface TaskItemProps {
  task: Task;
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function TaskItem({ task, onToggleComplete, onDelete }: TaskItemProps) {
  const [hours, minutes] = task.startTime.split(':').map(Number);
  const taskTime = new Date();
  taskTime.setHours(hours, minutes, 0, 0);

  return (
    <Card className={cn(
      "transition-all duration-300 ease-in-out hover:shadow-md",
      task.isCompleted ? 'bg-card/60 opacity-70' : 'bg-card'
    )}>
      <CardContent className="p-4 flex items-center gap-4">
        <Checkbox
          id={`task-${task.id}`}
          checked={task.isCompleted}
          onCheckedChange={() => onToggleComplete(task.id)}
          className="h-6 w-6 rounded-full"
          aria-label={`Mark ${task.title} as ${task.isCompleted ? 'incomplete' : 'complete'}`}
        />
        <div className="flex-1 grid gap-1">
          <label
            htmlFor={`task-${task.id}`}
            className={cn(
              "font-medium cursor-pointer transition-all",
              task.isCompleted ? 'line-through text-muted-foreground' : 'text-foreground'
            )}
          >
            {task.title}
          </label>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
             <Clock className="h-4 w-4" />
            <span>{taskTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</span>
            <span>&bull;</span>
            <span>{task.duration} min</span>
          </div>
        </div>
        
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon" className="text-muted-foreground shrink-0 hover:text-destructive h-8 w-8">
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Delete task</span>
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your task
                "{task.title}".
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => onDelete(task.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

      </CardContent>
    </Card>
  );
}
