'use client';

import Image from 'next/image';
import { Pill, Clock } from 'lucide-react';

import { Medicine } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '../ui/badge';
import { useState } from 'react';
import { useToast } from '../ui/use-toast';
import { Loader2 } from 'lucide-react';

interface MedicineCardProps {
  medicine: Medicine;
  time: string;
  isPending: boolean;
  updateIntake: (medicineId: string, medicineName: string, scheduledAt: string, status: 'taken' | 'missed') => Promise<any>;
}

export default function MedicineCard({ medicine, time, isPending, updateIntake }: MedicineCardProps) {
  const [taken, setTaken] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleTake = async () => {
    setIsSubmitting(true);
    try {
        await updateIntake(medicine.id, medicine.name, time, 'taken');
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

  const status = taken ? 'Taken' : isPending ? 'Pending' : 'Missed';
  
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
        {isPending && !taken && (
            <Button onClick={handleTake} className="rounded-full" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="animate-spin" /> : 'Take'}
            </Button>
        )}
      </CardContent>
    </Card>
  );
}
