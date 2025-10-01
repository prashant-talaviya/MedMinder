'use server';

import { getDatabase } from '@/lib/mongodb';
import { Medicine, MedicineIntake, UserStats } from '@/lib/types';
import { ObjectId } from 'mongodb';
import { revalidatePath } from 'next/cache';

export async function getMedicines(userId: string): Promise<Medicine[]> {
    if (!userId) return [];

    try {
        const db = await getDatabase();
        const medicines = await db.collection('medicines').find({ userId }).toArray();
        
        // Convert ObjectIds to strings for client components
        return medicines.map(medicine => ({
            ...medicine,
            _id: medicine._id.toString()
        })) as Medicine[];
    } catch (error) {
        console.error("Error fetching medicines:", error);
        return [];
    }
}

export async function getUserStats(userId: string): Promise<{ points: number; streak: number }> {
    if (!userId) return { points: 0, streak: 0 };
    
    try {
        const db = await getDatabase();
        const stats = await db.collection('userStats').findOne({ userId });
        
        if (stats) {
            return { points: stats.points, streak: stats.streak };
        } else {
            // Initialize stats if they don't exist
            await db.collection('userStats').insertOne({ 
                userId, 
                points: 0, 
                streak: 0 
            });
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
        const db = await getDatabase();
        
        // Add to history
        await db.collection('history').insertOne({
            userId,
            medicineId,
            medicineName,
            scheduledAt,
            status,
            takenAt: new Date(),
            points: status === 'taken' ? 10 : 0,
        });

        // Update points if taken
        if (status === 'taken') {
            await db.collection('userStats').updateOne(
                { userId },
                { 
                    $inc: { points: 10 },
                    $setOnInsert: { streak: 0 }
                },
                { upsert: true }
            );
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
        const db = await getDatabase();
        const history = await db.collection('history')
            .find({ userId })
            .sort({ takenAt: -1 })
            .toArray();
        
        // Convert ObjectIds to strings for client components
        return history.map(record => ({
            ...record,
            _id: record._id.toString()
        })) as MedicineIntake[];
    } catch(e) {
        console.error("Error fetching history: ", e);
        return [];
    }
}

export async function addMedicine(data: {
    userId: string;
    name: string;
    dosage: string;
    timing: 'before-food' | 'after-food' | 'any';
    use: string;
    description: string;
    schedule: string[];
    duration: number;
    quantity: number;
    photoUrl: string | null;
}) {
    try {
        const db = await getDatabase();
        
        const medicineData = {
            ...data,
            photoUrl: data.photoUrl || "https://picsum.photos/seed/med-placeholder/200/200",
            createdAt: new Date(),
        };

        await db.collection('medicines').insertOne(medicineData);

        revalidatePath('/dashboard');
        
        return { success: true };

    } catch(error) {
        console.error("Error adding medicine:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        return {
          success: false,
          error: `Failed to add medicine. ${errorMessage}`
        };
    }
}

export async function deleteMedicine(medicineId: string) {
    try {
        const db = await getDatabase();
        
        const result = await db.collection('medicines').deleteOne({ 
            _id: new ObjectId(medicineId) 
        });

        if (result.deletedCount === 0) {
            throw new Error('Medicine not found');
        }

        revalidatePath('/dashboard');
        revalidatePath('/medicines');
        
        return { success: true };

    } catch(error) {
        console.error("Error deleting medicine:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        throw new Error(`Failed to delete medicine. ${errorMessage}`);
    }
}

export async function updateMedicine(medicineId: string, updates: {
    duration?: number;
    status?: string;
    quantity?: number;
    schedule?: string[];
    [key: string]: any;
}) {
    try {
        const db = await getDatabase();
        
        const result = await db.collection('medicines').updateOne(
            { _id: new ObjectId(medicineId) },
            { $set: updates }
        );

        if (result.matchedCount === 0) {
            throw new Error('Medicine not found');
        }

        revalidatePath('/dashboard');
        revalidatePath('/medicines');
        
        return { success: true };

    } catch(error) {
        console.error("Error updating medicine:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        throw new Error(`Failed to update medicine. ${errorMessage}`);
    }
}

