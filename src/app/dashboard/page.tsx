import AppLayout from "@/components/AppLayout";
import MedicineCard from "@/components/dashboard/MedicineCard";
import NextReminder from "@/components/dashboard/NextReminder";
import RewardsSummary from "@/components/dashboard/RewardsSummary";
import { getMedicines, getUserStats, updateIntake } from "@/services/firestore";
import { Medicine } from "@/lib/types";
import { getTodaysSchedule } from "@/lib/utils";

export default async function DashboardPage() {
    const medicines = await getMedicines();
    const { points, streak } = await getUserStats();
    const todaysSchedule = getTodaysSchedule(medicines);
    const now = new Date();

    return (
        <AppLayout>
            <div className="space-y-6">
                <RewardsSummary points={points} streak={streak} />
                <NextReminder medicines={medicines} />
                
                <div>
                    <h2 className="text-xl font-bold font-headline mb-4">Today&apos;s Schedule</h2>
                    <div className="space-y-4">
                        {todaysSchedule.length > 0 ? (
                            todaysSchedule.map((dose, index) => {
                                const [time, period] = dose.time.split(' ');
                                const [hours, minutes] = time.split(':').map(Number);
                                const dateHours = period === 'PM' && hours !== 12 ? hours + 12 : (period === 'AM' && hours === 12 ? 0 : hours);
                                const doseTime = new Date();
                                doseTime.setHours(dateHours, minutes, 0, 0);

                                return (
                                    <MedicineCard 
                                        key={`${dose.medicine.id}-${index}`}
                                        medicine={dose.medicine}
                                        time={dose.time}
                                        isPending={doseTime >= now}
                                        updateIntake={updateIntake}
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
