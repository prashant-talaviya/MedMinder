'use client';

import Image from 'next/image';
import { Pill, Clock, Edit } from 'lucide-react';
import Link from 'next/link';

import { Medicine } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import type { updateIntake } from '@/services/mongodb';

interface TakenDose {
  medicineId: string;
  scheduleTime: string;
  date: string;
}

interface MedicineCardProps {
  medicine: Medicine;
  time: string;
  isPending: boolean;
  updateIntake: typeof updateIntake;
  userId: string;
  takenDoses?: TakenDose[];
}

export default function MedicineCard({ medicine, time, isPending, updateIntake, userId, takenDoses = [] }: MedicineCardProps) {
  const [taken, setTaken] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Check if this medicine was taken through the alarm system
  const isTakenViaAlarm = takenDoses.some(dose => {
    const medicineIdMatches = dose.medicineId === medicine._id?.toString();
    const dateMatches = dose.date === new Date().toISOString().split('T')[0];
    
    // Convert display time back to 24-hour format for comparison
    const [timeStr, period] = time.split(' ');
    const [hours, minutes] = timeStr.split(':').map(Number);
    const displayTime = period === 'PM' && hours !== 12 ? `${hours + 12}:${minutes.toString().padStart(2, '0')}` : 
                       period === 'AM' && hours === 12 ? `00:${minutes.toString().padStart(2, '0')}` :
                       `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    
    const timeMatches = dose.scheduleTime === displayTime;
    
    console.log('🔍 DEBUG: MedicineCard comparison for', medicine.name, {
      medicineId: medicine._id?.toString(),
      doseMedicineId: dose.medicineId,
      medicineIdMatches,
      displayTime,
      doseScheduleTime: dose.scheduleTime,
      timeMatches,
      dateMatches,
      isMatch: medicineIdMatches && dateMatches && timeMatches
    });
    
    return medicineIdMatches && dateMatches && timeMatches;
  });

  // Update taken state when alarm system marks it as taken
  useEffect(() => {
    console.log('🔍 DEBUG: MedicineCard useEffect for', medicine.name, {
      isTakenViaAlarm,
      takenDosesCount: takenDoses.length,
      currentTakenState: taken
    });
    
    if (isTakenViaAlarm) {
      console.log('✅ Setting taken=true for', medicine.name);
      setTaken(true);
    }
  }, [isTakenViaAlarm, takenDoses.length]);

  const handleTake = async () => {
    setIsSubmitting(true);
    try {
        await updateIntake({
            userId, 
            medicineId: medicine._id?.toString() || '', 
            medicineName: medicine.name, 
            scheduledAt: time, 
            status: 'taken'
        });
        setTaken(true);
        toast({
            title: "Dose Confirmed!",
            description: `You've earned 10 points for taking ${medicine.name}.`,
        });
    } catch (error) {
        toast({
            variant: "destructive",
            title: "Update Failed",
            description: "Could not update your intake status.",
        });
    } finally {
        setIsSubmitting(false);
    }
  };

  // Use isTakenViaAlarm directly instead of relying on local taken state
  const status = (taken || isTakenViaAlarm) ? 'Taken' : isPending ? 'Pending' : 'Missed';
  
  // Debug status calculation
  console.log('🔍 DEBUG: Status calculation for', medicine.name, {
    taken,
    isPending,
    isTakenViaAlarm,
    status,
    takenDosesCount: takenDoses.length
  });
  
  const statusColors = {
    Taken: 'bg-green-100 text-green-800 border-green-200',
    Pending: 'bg-blue-100 text-blue-800 border-blue-200',
    Missed: 'bg-red-100 text-red-800 border-red-200',
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4 flex gap-4 items-center">
        <Image
          src={medicine.photoUrl}
          alt={medicine.name}
          width={64}
          height={64}
          className="rounded-md object-cover w-16 h-16"
          data-ai-hint="medicine pill"
        />
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <h3 className="font-bold text-lg">{medicine.name}</h3>
            <Badge variant="outline" className={statusColors[status]}>{status}</Badge>
          </div>
          <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
            <Pill className="h-4 w-4" />
            <span>{medicine.dosage}</span>
            <span className="text-xs">&bull;</span>
            <span>{medicine.timing.replace('-', ' ')}</span>
          </p>
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>{time}</span>
          </p>
        </div>
        <div className="flex gap-2">
          {isPending && !taken && (
            <Button onClick={handleTake} className="rounded-full" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="animate-spin" /> : 'Take'}
            </Button>
          )}
          <Link href="/medicines">
            <Button variant="outline" size="sm" className="rounded-full">
              <Edit className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
