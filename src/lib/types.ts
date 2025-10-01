import { ObjectId } from 'mongodb';

export interface User {
  _id?: ObjectId;
  uid: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

export interface Medicine {
  _id?: ObjectId;
  userId: string;
  name: string;
  dosage: string; // e.g., "1-0-1"
  timing: 'before-food' | 'after-food' | 'any';
  use: string;
  description: string;
  schedule: string[]; // e.g., ["08:00", "14:00", "20:00"]
  duration: number; // in days
  quantity: number;
  photoUrl: string;
  createdAt: Date;
}

export interface MedicineIntake {
  _id?: ObjectId;
  userId: string;
  medicineId: string;
  medicineName: string;
  takenAt: Date; // Date object
  scheduledAt: string; // e.g., "08:00"
  status: 'taken' | 'missed' | 'pending';
  points: number;
}

export interface UserStats {
  _id?: ObjectId;
  userId: string;
  points: number;
  streak: number;
}
