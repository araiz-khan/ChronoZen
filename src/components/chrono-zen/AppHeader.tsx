'use client';

import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export default function AppHeader() {
  const [currentDate, setCurrentDate] = useState('');
  const [notificationPermission, setNotificationPermission] = useState('default');
  const { toast } = useToast();

  useEffect(() => {
    setCurrentDate(new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }));
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  const handleEnableNotifications = () => {
    if (!('Notification' in window)) {
      toast({ variant: 'destructive', title: 'Error', description: 'This browser does not support desktop notifications.' });
      return;
    }

    if (Notification.permission === 'granted') {
      toast({ title: 'Success', description: 'Notifications are already enabled.' });
      return;
    }

    if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        setNotificationPermission(permission);
        if (permission === 'granted') {
          toast({ title: 'Success', description: 'Notifications enabled!' });
           new Notification('ChronoZen', { body: 'You will now receive task reminders.' });
        } else {
          toast({ variant: 'destructive', title: 'Info', description: 'Notifications were not enabled.' });
        }
      });
    } else {
       toast({ variant: 'destructive', title: 'Info', description: 'Notifications are blocked. Please enable them in your browser settings.' });
    }
  };

  return (
    <header className="flex flex-col sm:flex-row justify-between items-center gap-4">
      <div className="text-center sm:text-left">
        <h1 className="text-4xl font-headline font-bold text-foreground tracking-tight">ChronoZen</h1>
        <p className="text-muted-foreground">{currentDate}</p>
      </div>
      {notificationPermission !== 'granted' && (
        <Button variant="outline" onClick={handleEnableNotifications}>
          <Bell className="mr-2 h-4 w-4" /> Enable Reminders
        </Button>
      )}
    </header>
  );
}
