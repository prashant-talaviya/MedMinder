'use client';

import AppLayout from "@/components/AppLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Card, CardContent } from "@/components/ui/card";
import { getHistory } from "@/services/mongodb";
import { MedicineIntake } from "@/lib/types";
import { CheckCircle2, XCircle, Pill } from "lucide-react";
import { format, isToday, isYesterday, parseISO } from 'date-fns';
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

const groupHistoryByDate = (history: MedicineIntake[]) => {
    return history.reduce((acc, item) => {
        const date = format(item.takenAt, 'yyyy-MM-dd');
        if (!acc[date]) {
            acc[date] = [];
        }
        acc[date].push(item);
        return acc;
    }, {} as Record<string, MedicineIntake[]>);
};

const formatDateHeading = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'MMMM d, yyyy');
}

function HistoryContent() {
    const { user } = useAuth();
    const [history, setHistory] = useState<MedicineIntake[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            setLoading(true);
            getHistory(user.uid).then(data => {
                setHistory(data);
                setLoading(false);
            });
        }
    }, [user]);
    
    if (loading) {
        return (
             <AppLayout>
                <div className="space-y-6">
                    <div>
                        <h1 className="text-2xl font-bold font-headline">Medicine History</h1>
                        <p className="text-muted-foreground">
                            A log of your medication adherence.
                        </p>
                    </div>
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                </div>
            </AppLayout>
        )
    }

    const groupedHistory = groupHistoryByDate(history);
    const sortedDates = Object.keys(groupedHistory).sort((a,b) => b.localeCompare(a));
    
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold font-headline">Medicine History</h1>
          <p className="text-muted-foreground">
            A log of your medication adherence.
          </p>
        </div>
        
        <div className="space-y-6">
            {sortedDates.length > 0 ? sortedDates.map(date => (
                <div key={date}>
                    <h2 className="font-bold mb-2">{formatDateHeading(date)}</h2>
                    <div className="space-y-2">
                    {groupedHistory[date].map(item => (
                        <Card key={item._id?.toString() || 'unknown'}>
                            <CardContent className="p-4 flex items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                {item.status === 'taken' ? (
                                    <CheckCircle2 className="h-6 w-6 text-green-500" />
                                ) : (
                                    <XCircle className="h-6 w-6 text-red-500" />
                                )}
                                <div>
                                    <p className="font-semibold">{item.medicineName}</p>
                                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                                        <Pill className="h-4 w-4" />
                                        <span>Scheduled for {item.scheduledAt}</span>
                                    </p>
                                </div>
                                </div>
                                {item.status === 'taken' && (
                                     <div className="text-sm font-semibold text-green-600">+{item.points} pts</div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                    </div>
                </div>
            )) : (
                <Card>
                    <CardContent className="p-8 text-center text-muted-foreground">
                        No history found. Start taking your medicine to see your progress!
                    </CardContent>
                </Card>
            )}
        </div>
      </div>
    </AppLayout>
  );
}

export default function HistoryPage() {
  return (
    <ProtectedRoute>
      <HistoryContent />
    </ProtectedRoute>
  );
}
