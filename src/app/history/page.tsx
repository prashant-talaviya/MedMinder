import AppLayout from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { mockHistory } from "@/lib/mock-data";
import { MedicineIntake } from "@/lib/types";
import { CheckCircle2, XCircle, Pill } from "lucide-react";
import { format, isToday, isYesterday, parseISO } from 'date-fns';

const groupHistoryByDate = (history: MedicineIntake[]) => {
    return history.reduce((acc, item) => {
        const date = format(parseISO(item.takenAt), 'yyyy-MM-dd');
        if (!acc[date]) {
            acc[date] = [];
        }
        acc[date].push(item);
        return acc;
    }, {} as Record<string, MedicineIntake[]>);
};

const formatDateHeading = (dateStr: string) => {
    const date = parseISO(dateStr);
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'MMMM d, yyyy');
}


export default function HistoryPage() {
    const groupedHistory = groupHistoryByDate(mockHistory);
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
            {sortedDates.map(date => (
                <div key={date}>
                    <h2 className="font-bold mb-2">{formatDateHeading(date)}</h2>
                    <div className="space-y-2">
                    {groupedHistory[date].map(item => (
                        <Card key={item.id}>
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
            ))}
        </div>
      </div>
    </AppLayout>
  );
}
