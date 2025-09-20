import { Medicine, MedicineIntake } from "./types";

export const mockMedicines: Medicine[] = [
  {
    id: "med1",
    userId: "mock-user-123",
    name: "Rosuvastatin",
    dosage: "0-0-1",
    timing: "after-food",
    use: "To lower cholesterol",
    description: "Take one tablet in the evening after your meal.",
    schedule: ["20:00"],
    startDate: new Date().toISOString(),
    duration: 30,
    quantity: 30,
    photoUrl: "https://picsum.photos/seed/med1/200/200",
  },
  {
    id: "med2",
    userId: "mock-user-123",
    name: "Metformin",
    dosage: "1-0-1",
    timing: "after-food",
    use: "For blood sugar control",
    description: "Take one tablet after breakfast and one after dinner.",
    schedule: ["09:00", "21:00"],
    startDate: new Date().toISOString(),
    duration: 90,
    quantity: 180,
    photoUrl: "https://picsum.photos/seed/med2/200/200",
  },
    {
    id: "med3",
    userId: "mock-user-123",
    name: "Vitamin D3",
    dosage: "1-0-0",
    timing: "after-food",
    use: "For bone health",
    description: "Take one capsule after breakfast.",
    schedule: ["09:30"],
    startDate: new Date().toISOString(),
    duration: 60,
    quantity: 60,
    photoUrl: "https://picsum.photos/seed/med3/200/200",
  },
];

export const mockUserStats = {
    points: 1240,
    streak: 14, // days
};

export const mockHistory: MedicineIntake[] = [
  {
    id: 'hist1',
    userId: 'mock-user-123',
    medicineId: 'med2',
    medicineName: 'Metformin',
    takenAt: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(),
    scheduledAt: "09:00",
    status: 'taken',
    points: 10,
  },
  {
    id: 'hist2',
    userId: 'mock-user-123',
    medicineId: 'med3',
    medicineName: 'Vitamin D3',
    takenAt: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(),
    scheduledAt: "09:30",
    status: 'taken',
    points: 10,
  },
    {
    id: 'hist3',
    userId: 'mock-user-123',
    medicineId: 'med1',
    medicineName: 'Rosuvastatin',
    takenAt: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(),
    scheduledAt: "20:00",
    status: 'taken',
    points: 10,
  },
    {
    id: 'hist4',
    userId: 'mock-user-123',
    medicineId: 'med2',
    medicineName: 'Metformin',
    takenAt: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(),
    scheduledAt: "21:00",
    status: 'missed',
    points: 0,
  },
];
