'use client';

import Image from 'next/image';
import { Pill, Clock } from 'lucide-react';

import { Medicine } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '../ui/badge';
import { useState } from 'react';
import { useToast } from '../ui/use-toast';

interface MedicineCardProps {
  medicine: Medicine;
  time: string;
  isPending: boolean;
}

export default function MedicineCard({ medicine, time, isPending }: MedicineCardProps) {
  const [taken, setTaken] = useState(false);
  const { toast } = useToast();

  const handleTake = () => {
    setTaken(true);
    toast({
        title: "Dose Confirmed!",
        description: `You've earned 10 points for taking ${medicine.name}.`,
    })
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
            <Button onClick={handleTake} className="rounded-full">Take</Button>
        )}
      </CardContent>
    </Card>
  );
}
