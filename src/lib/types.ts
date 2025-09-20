export interface User {
  uid: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

export interface Medicine {
  id: string;
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
  createdAt: any;
}

export interface MedicineIntake {
  id: string;
  userId: string;
  medicineId: string;
  medicineName: string;
  takenAt: string; // ISO date-time string
  scheduledAt: string; // e.g., "08:00"
  status: 'taken' | 'missed' | 'pending';
  points: number;
}
