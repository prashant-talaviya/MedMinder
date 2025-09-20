'use server';

import { db } from '@/lib/firebase';
import { Medicine, MedicineIntake } from '@/lib/types';
import { collection, getDocs, query, where, addDoc, serverTimestamp, doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';

export async function getMedicines(userId: string): Promise<Medicine[]> {
    if (!userId) return [];

    try {
        const q = query(collection(db, 'medicines'), where('userId', '==', userId));
        const querySnapshot = await getDocs(q);
        const medicines: Medicine[] = [];
        querySnapshot.forEach((doc) => {
            medicines.push({ id: doc.id, ...doc.data() } as Medicine);
        });
        return medicines;
    } catch (error) {
        console.error("Error fetching medicines:", error);
        return [];
    }
}

export async function getUserStats(userId: string): Promise<{ points: number; streak: number }> {
    if (!userId) return { points: 0, streak: 0 };
    
    try {
        const userStatsRef = doc(db, 'userStats', userId);
        const docSnap = await getDoc(userStatsRef);

        if (docSnap.exists()) {
            return docSnap.data() as { points: number; streak: number };
        } else {
            // Initialize stats if they don't exist
            await setDoc(userStatsRef, { points: 0, streak: 0 });
            return { points: 0, streak: 0 };
        }
    } catch (error) {
        console.error("Error fetching user stats:", error);
        return { points: 0, streak: 0 };
    }
}

export async function updateIntake({userId, medicineId, medicineName, scheduledAt, status}: {userId: string, medicineId: string, medicineName: string, scheduledAt: string, status: 'taken' | 'missed'}) {
    if (!userId) throw new Error("User not authenticated");

    try {
        // Add to history
        await addDoc(collection(db, 'history'), {
            userId,
            medicineId,
            medicineName,
            scheduledAt,
            status,
            takenAt: new Date().toISOString(),
            points: status === 'taken' ? 10 : 0,
        });

        // Update points if taken
        if (status === 'taken') {
            const userStatsRef = doc(db, 'userStats', userId);
             // Make sure the doc exists before trying to update it
            const docSnap = await getDoc(userStatsRef);
            if (docSnap.exists()) {
                await updateDoc(userStatsRef, {
                    points: increment(10)
                });
            } else {
                await setDoc(userStatsRef, { points: 10, streak: 0 });
            }
        }
        
        revalidatePath('/dashboard');
        revalidatePath('/history');
        
        return { success: true };

    } catch (error) {
        console.error("Error updating intake:", error);
        return { success: false, error: "Failed to update intake."};
    }
}


export async function getHistory(userId: string): Promise<MedicineIntake[]> {
    if (!userId) return [];
    
    try {
        const q = query(collection(db, 'history'), where('userId', '==', userId));
        const querySnapshot = await getDocs(q);
        const history: MedicineIntake[] = [];
        querySnapshot.forEach((doc) => {
            history.push({ id: doc.id, ...doc.data() } as MedicineIntake);
        });
        return history.sort((a, b) => new Date(b.takenAt).getTime() - new Date(a.takenAt).getTime());
    } catch(e) {
        console.error("Error fetching history: ", e);
        return [];
    }
}
