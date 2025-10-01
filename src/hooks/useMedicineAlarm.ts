'use client';

import { useEffect, useRef, useState } from 'react';
import { Medicine } from '@/lib/types';
import { updateIntake } from '@/services/mongodb';

interface AlarmState {
  isRinging: boolean;
  currentMedicine: Medicine | null;
  alarmTime: Date | null;
  currentScheduleTime: string | null;
}

interface TakenDose {
  medicineId: string;
  scheduleTime: string;
  date: string; // YYYY-MM-DD format
}

export function useMedicineAlarm(medicines: Medicine[], userId?: string) {
  const [alarmState, setAlarmState] = useState<AlarmState>({
    isRinging: false,
    currentMedicine: null,
    alarmTime: null,
    currentScheduleTime: null,
  });
  
  const [takenDoses, setTakenDoses] = useState<TakenDose[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('medminder-taken-doses');
      return stored ? JSON.parse(stored) : [];
    }
    return [];
  });
  const [snoozedDoses, setSnoozedDoses] = useState<Map<string, number>>(new Map());
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const beepIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const notificationPermissionRef = useRef<boolean>(false);

  // Helper functions
  const getTodayString = () => {
    return new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
  };

  const getDoseKey = (medicineId: string, scheduleTime: string) => {
    return `${medicineId}-${scheduleTime}-${getTodayString()}`;
  };

  const isDoseTaken = (medicineId: string, scheduleTime: string) => {
    const doseKey = getDoseKey(medicineId, scheduleTime);
    return takenDoses.some(dose => 
      dose.medicineId === medicineId && 
      dose.scheduleTime === scheduleTime && 
      dose.date === getTodayString()
    );
  };

  const isDoseSnoozed = (medicineId: string, scheduleTime: string) => {
    const doseKey = getDoseKey(medicineId, scheduleTime);
    const snoozeTime = snoozedDoses.get(doseKey);
    if (!snoozeTime) return false;
    
    const now = Date.now();
    return now < snoozeTime; // Still within snooze period
  };

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        notificationPermissionRef.current = permission === 'granted';
      });
    } else if ('Notification' in window) {
      notificationPermissionRef.current = Notification.permission === 'granted';
    }
  }, []);

  // Create audio context for alarm sound
  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio();
      // Create a continuous alarm sound using Web Audio API
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      const createContinuousAlarm = () => {
        const oscillator1 = audioContext.createOscillator();
        const oscillator2 = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator1.connect(gainNode);
        oscillator2.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // Create a two-tone alarm sound
        oscillator1.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator2.frequency.setValueAtTime(1000, audioContext.currentTime);
        oscillator1.type = 'sine';
        oscillator2.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.4, audioContext.currentTime);
        
        oscillator1.start(audioContext.currentTime);
        oscillator2.start(audioContext.currentTime);
        
        // Stop after 0.5 seconds for each beep
        oscillator1.stop(audioContext.currentTime + 0.5);
        oscillator2.stop(audioContext.currentTime + 0.5);
      };
      
      // Store the alarm function for later use
      (audioRef.current as any).createContinuousAlarm = createContinuousAlarm;
    }
  }, []);

  // Check for medicine times and trigger alarms
  useEffect(() => {
    const checkMedicineTimes = () => {
      const now = new Date();
      const currentTime = now.getHours() * 60 + now.getMinutes();
      const currentSeconds = now.getSeconds();
      
      medicines.forEach(medicine => {
        medicine.schedule.forEach(timeStr => {
          const [hours, minutes] = timeStr.split(':').map(Number);
          const medicineTime = hours * 60 + minutes;
          
          // Check if it's EXACTLY the scheduled time (within 30 seconds window)
          if (currentTime === medicineTime && currentSeconds <= 30) {
            const medicineId = medicine._id?.toString() || '';
            
            // Skip if already taken or currently snoozed
            if (isDoseTaken(medicineId, timeStr) || isDoseSnoozed(medicineId, timeStr)) {
              return;
            }
            
            // Use functional update to avoid dependency on alarmState
            setAlarmState(prevState => {
              // Only trigger alarm if not already ringing
              if (!prevState.isRinging) {
                console.log(`🔔 ALARM TRIGGERED for ${medicine.name} at ${timeStr}`);
                
                // Show browser notification
                if (notificationPermissionRef.current) {
                  new Notification(`Time to take ${medicine.name}!`, {
                    body: `It's time to take your ${medicine.dosage} dose of ${medicine.name}`,
                    icon: '/favicon.ico',
                    tag: `medicine-${medicine._id}-${timeStr}`,
                    requireInteraction: true,
                  });
                }
                
                // Play continuous alarm sound
                if (audioRef.current && (audioRef.current as any).createContinuousAlarm) {
                  // Clear any existing alarm interval
                  if (beepIntervalRef.current) {
                    clearInterval(beepIntervalRef.current);
                  }
                  
                  const playAlarm = () => {
                    (audioRef.current as any).createContinuousAlarm();
                  };
                  
                  // Play immediately and then every 1.5 seconds for continuous alarm
                  playAlarm();
                  beepIntervalRef.current = setInterval(playAlarm, 1500);
                }

                return {
                  isRinging: true,
                  currentMedicine: medicine,
                  alarmTime: now,
                  currentScheduleTime: timeStr,
                };
              }
              return prevState;
            });
          }
        });
      });
    };

    // Check every 5 seconds for more accurate timing
    intervalRef.current = setInterval(checkMedicineTimes, 5000);
    
    // Also check immediately
    checkMedicineTimes();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (beepIntervalRef.current) {
        clearInterval(beepIntervalRef.current);
      }
    };
  }, [medicines, isDoseTaken, isDoseSnoozed]);

  // Register service worker for better notifications
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('Service Worker registered successfully');
        })
        .catch(error => {
          console.log('Service Worker registration failed:', error);
        });
    }
  }, []);

  // Clean up old taken doses (older than today)
  useEffect(() => {
    const today = getTodayString();
    setTakenDoses(prev => {
      const filtered = prev.filter(dose => dose.date === today);
      if (filtered.length !== prev.length) {
        // Save updated list to localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('medminder-taken-doses', JSON.stringify(filtered));
        }
      }
      return filtered;
    });
  }, []); // Run once on mount

  const markDoseAsTaken = async () => {
    if (alarmState.currentMedicine && alarmState.currentScheduleTime && userId) {
      const medicineId = alarmState.currentMedicine._id?.toString() || '';
      const newTakenDose: TakenDose = {
        medicineId,
        scheduleTime: alarmState.currentScheduleTime,
        date: getTodayString(),
      };
      
      console.log('🔍 DEBUG: markDoseAsTaken called with:', {
        medicineId,
        scheduleTime: alarmState.currentScheduleTime,
        date: getTodayString(),
        medicineName: alarmState.currentMedicine.name
      });
      
      try {
        // Update the medicine status in the database
        await updateIntake({
          userId,
          medicineId,
          medicineName: alarmState.currentMedicine.name,
          scheduledAt: alarmState.currentScheduleTime,
          status: 'taken'
        });
        
        setTakenDoses(prev => {
          const updated = [...prev, newTakenDose];
          // Save to localStorage
          if (typeof window !== 'undefined') {
            localStorage.setItem('medminder-taken-doses', JSON.stringify(updated));
          }
          console.log('🔍 DEBUG: Updated takenDoses:', updated);
          return updated;
        });
        console.log('✅ Dose marked as taken and updated in database:', newTakenDose);
      } catch (error) {
        console.error('❌ Failed to update medicine status:', error);
        // Still mark as taken locally even if database update fails
        setTakenDoses(prev => {
          const updated = [...prev, newTakenDose];
          if (typeof window !== 'undefined') {
            localStorage.setItem('medminder-taken-doses', JSON.stringify(updated));
          }
          console.log('🔍 DEBUG: Updated takenDoses (fallback):', updated);
          return updated;
        });
      }
    }
  };

  const snoozeDose = () => {
    if (alarmState.currentMedicine && alarmState.currentScheduleTime) {
      const medicineId = alarmState.currentMedicine._id?.toString() || '';
      const doseKey = getDoseKey(medicineId, alarmState.currentScheduleTime);
      const snoozeUntil = Date.now() + (5 * 60 * 1000); // 5 minutes from now
      
      setSnoozedDoses(prev => new Map(prev.set(doseKey, snoozeUntil)));
      console.log('Dose snoozed until:', new Date(snoozeUntil));
      
      // Set a timeout to trigger the alarm again after 5 minutes
      setTimeout(() => {
        console.log(`🔔 SNOOZE ALARM TRIGGERED for ${alarmState.currentMedicine?.name}`);
        
        // Check if the dose is still snoozed (not taken in the meantime)
        const currentSnoozeTime = snoozedDoses.get(doseKey);
        if (currentSnoozeTime && Date.now() >= currentSnoozeTime) {
          // Trigger the alarm again
          setAlarmState(prevState => {
            if (!prevState.isRinging && alarmState.currentMedicine && alarmState.currentScheduleTime) {
              return {
                isRinging: true,
                currentMedicine: alarmState.currentMedicine,
                alarmTime: new Date(),
                currentScheduleTime: alarmState.currentScheduleTime,
              };
            }
            return prevState;
          });
        }
      }, 5 * 60 * 1000);
    }
  };

  const stopAlarm = () => {
    console.log('Stopping alarm...');
    
    // Clear beep interval when stopping alarm
    if (beepIntervalRef.current) {
      clearInterval(beepIntervalRef.current);
      beepIntervalRef.current = null;
    }
    
    setAlarmState({
      isRinging: false,
      currentMedicine: null,
      alarmTime: null,
      currentScheduleTime: null,
    });
    
    console.log('Alarm stopped');
  };

  return {
    alarmState,
    stopAlarm,
    markDoseAsTaken,
    snoozeDose,
    takenDoses,
  };
}
