'use client';

import { useState, useEffect } from 'react';
import type { Task } from '@/lib/types';
import { Plus } from 'lucide-react';
import AppHeader from '@/components/chrono-zen/AppHeader';
import TaskList from '@/components/chrono-zen/TaskList';
import { AddTaskDialog } from '@/components/chrono-zen/AddTaskForm';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    try {
      const storedTasks = localStorage.getItem('chrono-zen-tasks');
      if (storedTasks) {
        setTasks(JSON.parse(storedTasks));
      }
    } catch (error) {
      console.error("Failed to parse tasks from localStorage", error);
    }
  }, []);

  useEffect(() => {
    if (isMounted) {
      try {
        localStorage.setItem('chrono-zen-tasks', JSON.stringify(tasks));
      } catch (error) {
        console.error("Failed to save tasks to localStorage", error);
      }
    }
  }, [tasks, isMounted]);

  const addTask = (newTask: Omit<Task, 'id' | 'isCompleted'>) => {
    const task: Task = {
      ...newTask,
      id: crypto.randomUUID(),
      isCompleted: false,
    };
    setTasks(prevTasks => [...prevTasks, task].sort((a, b) => a.startTime.localeCompare(b.startTime)));
  };

  const toggleTaskCompletion = (taskId: string) => {
    setTasks(tasks.map(task =>
      task.id === taskId ? { ...task, isCompleted: !task.isCompleted } : task
    ));
  };

  const deleteTask = (taskId: string) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  if (!isMounted) {
    return (
       <div className="min-h-screen bg-background text-foreground">
        <main className="container mx-auto max-w-2xl px-4 py-8 md:py-12">
           <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-center sm:text-left space-y-2">
              <Skeleton className="h-10 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
            <Skeleton className="h-10 w-36" />
          </div>
          <div className="mt-8 space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="container mx-auto max-w-2xl px-4 py-8 md:py-12">
        <AppHeader />

        <div className="mt-8">
          <TaskList
            tasks={tasks}
            onToggleComplete={toggleTaskCompletion}
            onDelete={deleteTask}
          />
        </div>

        <div className="mt-8 text-center">
          <AddTaskDialog onAddTask={addTask} allTasks={tasks}>
            <Button size="lg" className="rounded-full shadow-lg bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="mr-2 h-5 w-5" />
              Add New Task
            </Button>
          </AddTaskDialog>
        </div>
      </main>
    </div>
  );
}
