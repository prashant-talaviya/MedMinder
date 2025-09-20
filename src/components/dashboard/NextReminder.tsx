'use client'

import { AlarmClock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { useEffect, useState } from "react";
import { Medicine } from "@/lib/types";

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


export default function NextReminder({ medicines }: NextReminderProps) {
    const [timeLeft, setTimeLeft] = useState('');
    const [{nextDoseTime, nextDoseMedicine}, setNextDose] = useState(getNextDose(medicines));
    
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

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-headline">Next Reminder</CardTitle>
                <AlarmClock className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-bold">{timeLeft}</div>
                <p className="text-sm text-muted-foreground">for {nextDoseMedicine.name} at {nextDoseTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
            </CardContent>
        </Card>
    )
}

interface NextReminderProps {
    medicines: Medicine[];
}
