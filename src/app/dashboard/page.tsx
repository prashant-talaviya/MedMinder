import AppLayout from "@/components/AppLayout";
import MedicineCard from "@/components/dashboard/MedicineCard";
import NextReminder from "@/components/dashboard/NextReminder";
import RewardsSummary from "@/components/dashboard/RewardsSummary";
import { mockMedicines, mockUserStats } from "@/lib/mock-data";
import { Medicine } from "@/lib/types";

interface ScheduledDose {
  time: string;
  medicine: Medicine;
}

const getTodaysSchedule = (medicines: Medicine[]): ScheduledDose[] => {
  const schedule: ScheduledDose[] = [];
  const now = new Date();

  medicines.forEach(med => {
    med.schedule.forEach(time => {
      const [hours, minutes] = time.split(':').map(Number);
      const doseTime = new Date();
      doseTime.setHours(hours, minutes, 0, 0);
      
      schedule.push({ time: doseTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), medicine: med });
    });
  });

  return schedule.sort((a, b) => a.time.localeCompare(b.time));
}

export default function DashboardPage() {
    const { points, streak } = mockUserStats;
    const todaysSchedule = getTodaysSchedule(mockMedicines);
    const now = new Date();

    return (
        <AppLayout>
            <div className="space-y-6">
                <RewardsSummary points={points} streak={streak} />
                <NextReminder medicines={mockMedicines} />
                
                <div>
                    <h2 className="text-xl font-bold font-headline mb-4">Today&apos;s Schedule</h2>
                    <div className="space-y-4">
                        {todaysSchedule.length > 0 ? (
                            todaysSchedule.map((dose, index) => {
                                const [time, period] = dose.time.split(' ');
                                const [hours, minutes] = time.split(':').map(Number);
                                const dateHours = period === 'PM' && hours !== 12 ? hours + 12 : hours;
                                const doseTime = new Date();
                                doseTime.setHours(dateHours, minutes, 0, 0);

                                return (
                                    <MedicineCard 
                                        key={`${dose.medicine.id}-${index}`}
                                        medicine={dose.medicine}
                                        time={dose.time}
                                        isPending={doseTime >= now}
                                    />
                                );
                            })
                        ) : (
                            <p className="text-muted-foreground text-center py-8">No medicines scheduled for today.</p>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    )
}
