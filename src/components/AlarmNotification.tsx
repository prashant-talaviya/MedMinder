'use client';

import { useEffect, useState } from 'react';
import { X, Pill, Clock, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Medicine } from '@/lib/types';

interface AlarmNotificationProps {
  isVisible: boolean;
  medicine: Medicine | null;
  onDismiss: () => void;
  onTakeMedicine: () => void;
}

export default function AlarmNotification({ 
  isVisible, 
  medicine, 
  onDismiss, 
  onTakeMedicine 
}: AlarmNotificationProps) {
  const [isFlashing, setIsFlashing] = useState(false);

  console.log('AlarmNotification render - isVisible:', isVisible, 'medicine:', medicine?.name);

  useEffect(() => {
    if (isVisible) {
      setIsFlashing(true);
      const interval = setInterval(() => {
        setIsFlashing(prev => !prev);
      }, 1000);
      
      return () => clearInterval(interval);
    } else {
      setIsFlashing(false);
    }
  }, [isVisible]);

  if (!isVisible || !medicine) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className={`w-full max-w-md ${isFlashing ? 'animate-pulse' : ''} border-2 border-red-500 shadow-2xl`}>
        <CardHeader className="bg-red-50 border-b border-red-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Volume2 className="h-6 w-6 text-red-600 animate-bounce" />
              <CardTitle className="text-xl text-red-800">Medicine Reminder</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onDismiss}
              className="text-red-600 hover:text-red-800"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="bg-red-100 p-4 rounded-full">
                <Pill className="h-12 w-12 text-red-600" />
              </div>
            </div>
            
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Time to take {medicine.name}!
              </h3>
              <p className="text-gray-600 mb-4">
                It's time for your {medicine.dosage} dose
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                <Clock className="h-4 w-4" />
                <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={() => {
                  console.log('I will take button clicked');
                  onTakeMedicine();
                }}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                size="lg"
              >
                <Pill className="h-4 w-4 mr-2" />
                I will take
              </Button>
              <Button
                onClick={() => {
                  console.log('Remind Later button clicked');
                  onDismiss();
                }}
                variant="outline"
                className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                size="lg"
              >
                Remind Later
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
