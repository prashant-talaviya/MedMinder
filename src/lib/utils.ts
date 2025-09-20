import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Medicine } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

interface ScheduledDose {
  time: string;
  medicine: Medicine;
}

export const getTodaysSchedule = (medicines: Medicine[]): ScheduledDose[] => {
  const schedule: ScheduledDose[] = [];

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
