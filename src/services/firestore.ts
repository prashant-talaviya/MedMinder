'use server';

import { auth, db } from '@/lib/firebase';
import { Medicine, MedicineIntake, User } from '@/lib/types';
import { collection, getDocs, query, where, addDoc, serverTimestamp, doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';

async function getUserId(): Promise<string | null> {
    // This is a workaround to get the currently signed-in user on the server.
    // In a real app, you would have a more robust session management system.
    // For this demo, we'll rely on the client-side auth state which is not ideal for server actions.
    // A proper solution would involve session cookies or passing auth tokens.
    // Since we are using anonymous auth, we can't easily get the user on the server.
    // The client will pass the userId when it can.
    return auth.currentUser?.uid || null;
}

export async function getMedicines(): Promise<Medicine[]> {
    const userId = await getUserId();
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

export async function getUserStats(): Promise<{ points: number; streak: number }> {
    const userId = await getUserId();
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

export async function updateIntake(medicineId: string, medicineName: string, scheduledAt: string, status: 'taken' | 'missed') {
    const userId = await getUserId();
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
            await updateDoc(userStatsRef, {
                points: increment(10)
            });
        }
        
        revalidatePath('/dashboard');
        revalidatePath('/history');
        
        return { success: true };

    } catch (error) {
        console.error("Error updating intake:", error);
        return { success: false, error: "Failed to update intake."};
    }
}


export async function getHistory(): Promise<MedicineIntake[]> {
    const userId = await getUserId();
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
