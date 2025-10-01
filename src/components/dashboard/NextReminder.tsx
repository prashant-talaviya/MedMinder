'use client'

import { AlarmClock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { useEffect, useState } from "react";
import { Medicine } from "@/lib/types";
import AlarmNotification from "../AlarmNotification";
import { useToast } from "@/hooks/use-toast";

const getNextDose = (medicines: Medicine[]) => {
    const now = new Date();
    let nextDoseTime: Date | null = null;
    let nextDoseMedicine: Medicine | null = null;

    medicines.forEach(med => {
        med.schedule.forEach(timeStr => {
            const [hours, minutes] = timeStr.split(':').map(Number);
            const doseTime = new Date();
            doseTime.setHours(hours, minutes, 0, 0);

            if (doseTime > now) {
                if (!nextDoseTime || doseTime < nextDoseTime) {
                    nextDoseTime = doseTime;
                    nextDoseMedicine = med;
                }
            }
        });
    });

    // If no dose today, find the first dose tomorrow
    if (!nextDoseTime && medicines.length > 0) {
        medicines.forEach(med => {
             med.schedule.forEach(timeStr => {
                const [hours, minutes] = timeStr.split(':').map(Number);
                const doseTime = new Date();
                doseTime.setDate(doseTime.getDate() + 1);
                doseTime.setHours(hours, minutes, 0, 0);

                if (!nextDoseTime || doseTime < nextDoseTime) {
                    nextDoseTime = doseTime;
                    nextDoseMedicine = med;
                }
            });
        });
    }

    return { nextDoseTime, nextDoseMedicine };
};


export default function NextReminder({ medicines, onMedicineUpdate, alarmState, stopAlarm, markDoseAsTaken, snoozeDose }: NextReminderProps) {
    const [timeLeft, setTimeLeft] = useState('');
    const [{nextDoseTime, nextDoseMedicine}, setNextDose] = useState(getNextDose(medicines));
    const { toast } = useToast();
    
    useEffect(() => {
        setNextDose(getNextDose(medicines));
    }, [medicines]);

    useEffect(() => {
        if (!nextDoseTime) {
             setTimeLeft('');
             return;
        };

        const interval = setInterval(() => {
            const now = new Date();
            const diff = nextDoseTime.getTime() - now.getTime();

            if (diff <= 0) {
                setTimeLeft('Time to take!');
                clearInterval(interval);
                return;
            }

            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);
            
            setTimeLeft(`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);

        }, 1000);

        return () => clearInterval(interval);
    }, [nextDoseTime]);

    if (!nextDoseTime || !nextDoseMedicine) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg font-headline">Next Reminder</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">No upcoming doses. Add a medicine to get started!</p>
                </CardContent>
            </Card>
        );
    }

    const handleTakeMedicine = async () => {
        console.log('🔍 DEBUG: handleTakeMedicine called, alarmState:', alarmState);
        if (alarmState.currentMedicine) {
            // Mark the dose as taken and update database
            console.log('🔍 DEBUG: Calling markDoseAsTaken...');
            await markDoseAsTaken();
            console.log('🔍 DEBUG: markDoseAsTaken completed');
            
            // Refresh the medicines list to update status
            if (onMedicineUpdate) {
                console.log('🔍 DEBUG: Calling onMedicineUpdate...');
                onMedicineUpdate();
                console.log('🔍 DEBUG: onMedicineUpdate completed');
            }
            
            toast({
                title: "Medicine Marked as Taken!",
                description: `You won't be reminded for ${alarmState.currentMedicine.name} at this time again today.`,
            });
        }
        stopAlarm();
    };

    const handleDismissAlarm = () => {
        console.log('handleDismissAlarm called, alarmState:', alarmState);
        if (alarmState.currentMedicine) {
            // Snooze the dose for 5 minutes
            snoozeDose();
            
            toast({
                title: "Reminder Set for 5 Minutes",
                description: `We'll remind you again in exactly 5 minutes to take ${alarmState.currentMedicine.name}.`,
            });
        }
        stopAlarm();
    };

    return (
        <>
            <Card className={alarmState.isRinging ? 'ring-4 ring-red-500 animate-pulse' : ''}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-lg font-headline">Next Reminder</CardTitle>
                    <AlarmClock className={`h-5 w-5 ${alarmState.isRinging ? 'text-red-500 animate-bounce' : 'text-muted-foreground'}`} />
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold">{timeLeft}</div>
                    <p className="text-sm text-muted-foreground">for {nextDoseMedicine.name} at {nextDoseTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    {alarmState.isRinging && (
                        <div className="mt-2 p-2 bg-red-100 border border-red-300 rounded-md">
                            <p className="text-sm text-red-800 font-medium">
                                🔔 It's time to take your medicine!
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
            
            <AlarmNotification
                isVisible={alarmState.isRinging}
                medicine={alarmState.currentMedicine}
                onDismiss={handleDismissAlarm}
                onTakeMedicine={handleTakeMedicine}
            />
        </>
    )
}

interface AlarmState {
    isRinging: boolean;
    currentMedicine: Medicine | null;
    alarmTime: Date | null;
    currentScheduleTime: string | null;
}

interface NextReminderProps {
    medicines: Medicine[];
    onMedicineUpdate?: () => void;
    alarmState: AlarmState;
    stopAlarm: () => void;
    markDoseAsTaken: () => Promise<void>;
    snoozeDose: () => void;
}
