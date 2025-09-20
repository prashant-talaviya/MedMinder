import AppLayout from "@/components/AppLayout";
import { AddMedicineForm } from "./AddMedicineForm";

export default function AddMedicinePage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold font-headline">Add New Medicine</h1>
          <p className="text-muted-foreground">
            Upload a photo to let AI help, or fill in the details manually.
          </p>
        </div>
        <AddMedicineForm />
      </div>
    </AppLayout>
  );
}
