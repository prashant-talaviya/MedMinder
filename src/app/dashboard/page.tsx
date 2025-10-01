'use client';

import AppLayout from "@/components/AppLayout";
import MedicineCard from "@/components/dashboard/MedicineCard";
import NextReminder from "@/components/dashboard/NextReminder";
import RewardsSummary from "@/components/dashboard/RewardsSummary";
import ProtectedRoute from "@/components/ProtectedRoute";
import { getMedicines, getUserStats, updateIntake } from "@/services/mongodb";
import { Medicine } from "@/lib/types";
import { getTodaysSchedule } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useMedicineAlarm } from "@/hooks/useMedicineAlarm";

function DashboardContent() {
    const { user } = useAuth();
    const [medicines, setMedicines] = useState<Medicine[]>([]);
    const [stats, setStats] = useState({ points: 0, streak: 0 });
    const [loading, setLoading] = useState(true);
    
    // Only initialize alarm hook if user exists
    const { takenDoses, alarmState, stopAlarm, markDoseAsTaken, snoozeDose } = useMedicineAlarm(
        medicines, 
        user?.uid || ''
    );
    
    // Debug takenDoses
    console.log('🔍 DEBUG: Dashboard takenDoses:', takenDoses);

    const refreshMedicines = async () => {
        console.log('🔍 DEBUG: refreshMedicines called');
        if (user) {
            console.log('🔍 DEBUG: Fetching fresh medicines data...');
            const medicinesData = await getMedicines(user.uid);
            console.log('🔍 DEBUG: Fresh medicines data:', medicinesData);
            setMedicines(medicinesData);
            console.log('🔍 DEBUG: Medicines state updated');
        }
    };

    useEffect(() => {
        if (user) {
            const fetchData = async () => {
                setLoading(true);
                const [medicinesData, statsData] = await Promise.all([
                    getMedicines(user.uid),
                    getUserStats(user.uid)
                ]);
                setMedicines(medicinesData);
                setStats(statsData);
                setLoading(false);
            };
            fetchData();
        }
    }, [user]);

    if (loading) {
        return (
            <AppLayout>
                <div className="space-y-6">
                    <Skeleton className="h-36 w-full" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-44 w-full" />
                </div>
            </AppLayout>
        )
    }

    const todaysSchedule = getTodaysSchedule(medicines);
    const now = new Date();

    return (
        <AppLayout>
            <div className="space-y-6">
                <RewardsSummary points={stats.points} streak={stats.streak} medicines={medicines} />
                <NextReminder 
                    medicines={medicines} 
                    onMedicineUpdate={refreshMedicines}
                    alarmState={alarmState}
                    stopAlarm={stopAlarm}
                    markDoseAsTaken={markDoseAsTaken}
                    snoozeDose={snoozeDose}
                />
                
                <div>
                    <h2 className="text-xl font-bold font-headline mb-4">Today's Schedule</h2>
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
                                        key={`${dose.medicine._id?.toString() || 'unknown'}-${index}`}
                                        medicine={dose.medicine}
                                        time={dose.time}
                                        isPending={doseTime >= now}
                                        updateIntake={updateIntake}
                                        userId={user!.uid}
                                        takenDoses={takenDoses}
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

export default function DashboardPage() {
    return (
        <ProtectedRoute>
            <DashboardContent />
        </ProtectedRoute>
    );
}
