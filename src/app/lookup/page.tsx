
import AppLayout from "@/components/AppLayout";
import { MedicineLookup } from "./MedicineLookup";

export default function LookupPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold font-headline">Medicine Lookup</h1>
          <p className="text-muted-foreground">
            Upload a photo to get instant details about your medicine.
          p>
        </div>
        <MedicineLookup />
      </div>
    </AppLayout>
  );
}
