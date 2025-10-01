'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Bell, TestTube } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function TestAlarm() {
  const [testTime, setTestTime] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const { toast } = useToast();

  const testAlarm = () => {
    if (!testTime) {
      toast({
        title: "Invalid Time",
        description: "Please enter a time to test the alarm.",
        variant: "destructive",
      });
      return;
    }

    const [hours, minutes] = testTime.split(':').map(Number);
    const now = new Date();
    const testDate = new Date();
    testDate.setHours(hours, minutes, 0, 0);

    // If the time has passed today, set it for tomorrow
    if (testDate <= now) {
      testDate.setDate(testDate.getDate() + 1);
    }

    const delay = testDate.getTime() - now.getTime();
    
    setIsTesting(true);
    
    toast({
      title: "Test Alarm Scheduled",
      description: `Alarm will trigger at ${testDate.toLocaleTimeString()}`,
    });

    setTimeout(() => {
      // Trigger browser notification
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Test Medicine Reminder!', {
          body: 'This is a test alarm for your medicine reminder system.',
          icon: '/favicon.ico',
          requireInteraction: true,
        });
      }

      // Play test sound
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);

      toast({
        title: "Test Alarm Triggered!",
        description: "If you heard a sound and saw a notification, your alarm system is working!",
      });

      setIsTesting(false);
    }, delay);
  };

  const testImmediateAlarm = () => {
    // Trigger immediate test
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Immediate Test Alarm!', {
        body: 'This is an immediate test of your medicine reminder system. Click "I Took It" to test the close functionality.',
        icon: '/favicon.ico',
        requireInteraction: true,
      });
    }

    // Play test sound
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);

    toast({
      title: "Immediate Test Triggered!",
      description: "Check if you heard a sound and saw a notification. Test the 'I Took It' button to ensure it closes properly.",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="h-5 w-5" />
          Test Alarm System
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Test your medicine reminder alarm system to make sure it's working properly.
        </p>
        
        <div className="space-y-2">
          <Label htmlFor="test-time">Test Time (HH:MM)</Label>
          <Input
            id="test-time"
            type="time"
            value={testTime}
            onChange={(e) => setTestTime(e.target.value)}
            placeholder="14:30"
          />
        </div>

        <div className="flex gap-2">
          <Button
            onClick={testAlarm}
            disabled={isTesting}
            className="flex-1"
          >
            <Bell className="h-4 w-4 mr-2" />
            {isTesting ? 'Testing...' : 'Schedule Test'}
          </Button>
          
          <Button
            onClick={testImmediateAlarm}
            variant="outline"
            className="flex-1"
          >
            <TestTube className="h-4 w-4 mr-2" />
            Test Now
          </Button>
        </div>

        <div className="text-xs text-muted-foreground">
          <p>• Make sure to allow notifications when prompted</p>
          <p>• The "Test Now" button triggers an immediate alarm</p>
          <p>• The "Schedule Test" button sets an alarm for the specified time</p>
        </div>
      </CardContent>
    </Card>
  );
}
