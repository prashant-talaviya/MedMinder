'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Camera, Loader2, Pill, Clock, CalendarDays, Hash } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import { analyzeMedicineImage } from './actions';
import { useRouter } from 'next/navigation';

const scheduleTimings = [
  { id: 'morning', label: 'Morning (9 AM)', value: '09:00' },
  { id: 'noon', label: 'Noon (2 PM)', value: '14:00' },
  { id: 'evening', label: 'Evening (9 PM)', value: '21:00' },
];

const formSchema = z.object({
  name: z.string().min(2, 'Medicine name is required.'),
  dosage: z.string().min(1, 'Dosage is required (e.g., 1-0-1).'),
  timing: z.enum(['before-food', 'after-food', 'any']),
  use: z.string().min(3, 'Use/Purpose is required.'),
  description: z.string(),
  schedule: z.array(z.string()).min(1, 'At least one schedule time must be selected.'),
  duration: z.coerce.number().min(1, 'Duration must be at least 1 day.'),
  quantity: z.coerce.number().min(1, 'Quantity is required.'),
});

type FormData = z.infer<typeof formSchema>;

export function AddMedicineForm() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      timing: 'after-food',
      schedule: [],
      description: '',
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!imagePreview) return;
    setIsAnalyzing(true);
    try {
      const formData = new FormData();
      formData.append('photoDataUri', imagePreview);

      const result = await analyzeMedicineImage(formData);
      
      if(result.success && result.data) {
        setValue('name', result.data.description.split(' ')[0] || "Medicine", { shouldValidate: true });
        setValue('dosage', result.data.dosage, { shouldValidate: true });
        const timing = result.data.timing.toLowerCase().includes('before') ? 'before-food' : 'after-food';
        setValue('timing', timing, { shouldValidate: true });
        setValue('use', result.data.use, { shouldValidate: true });
        setValue('description', result.data.description, { shouldValidate: true });
        toast({
          title: "Analysis Complete",
          description: "Medicine details have been pre-filled.",
        });
      } else {
        throw new Error(result.error || "Unknown error from analysis");
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Could not analyze the image.",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const onSubmit = (data: FormData) => {
    console.log(data);
    toast({
        title: "Medicine Added!",
        description: `${data.name} has been added to your schedule.`,
    });
    router.push('/dashboard');
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardContent className="p-4 flex flex-col items-center justify-center">
          {imagePreview ? (
            <Image src={imagePreview} alt="Medicine preview" width={200} height={200} className="rounded-lg object-contain" />
          ) : (
            <div className="flex flex-col items-center gap-2 text-muted-foreground p-8 border-2 border-dashed rounded-lg">
              <Camera className="h-10 w-10" />
              <span>Upload a photo</span>
            </div>
          )}
          <div className="mt-4 grid grid-cols-2 gap-2 w-full max-w-sm">
            <Button type="button" variant="outline" asChild>
                <label htmlFor="photo-upload" className="cursor-pointer">Upload</label>
            </Button>
            <input id="photo-upload" type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            <Button type="button" onClick={handleAnalyze} disabled={!imagePreview || isAnalyzing}>
              {isAnalyzing ? <Loader2 className="animate-spin" /> : 'Analyze with AI'}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Medicine Name</Label>
          <Input id="name" {...register('name')} placeholder="e.g., Paracetamol 500mg" />
          {errors.name && <p className="text-destructive text-sm mt-1">{errors.name.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dosage">Dosage</Label>
              <Input id="dosage" {...register('dosage')} placeholder="e.g., 1-0-1" />
              {errors.dosage && <p className="text-destructive text-sm mt-1">{errors.dosage.message}</p>}
            </div>
            <div>
              <Label htmlFor="timing">Timing</Label>
              <Controller
                name="timing"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger><SelectValue placeholder="Select timing" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="after-food">After Food</SelectItem>
                      <SelectItem value="before-food">Before Food</SelectItem>
                      <SelectItem value="any">Any Time</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
        </div>
        
        <div>
          <Label htmlFor="use">Purpose / Use</Label>
          <Textarea id="use" {...register('use')} placeholder="For fever and pain relief" />
          {errors.use && <p className="text-destructive text-sm mt-1">{errors.use.message}</p>}
        </div>

        <div>
            <Label>Schedule</Label>
            <Controller
                name="schedule"
                control={control}
                render={({ field }) => (
                    <div className="mt-2 grid grid-cols-3 gap-2">
                        {scheduleTimings.map(item => (
                            <div key={item.id} className="flex items-center space-x-2 p-2 border rounded-md">
                                <Checkbox
                                    id={item.id}
                                    checked={field.value?.includes(item.value)}
                                    onCheckedChange={(checked) => {
                                        return checked
                                        ? field.onChange([...(field.value || []), item.value])
                                        : field.onChange(field.value?.filter((v) => v !== item.value))
                                    }}
                                />
                                <label htmlFor={item.id} className="text-sm font-medium leading-none">{item.label}</label>
                            </div>
                        ))}
                    </div>
                )}
            />
            {errors.schedule && <p className="text-destructive text-sm mt-1">{errors.schedule.message}</p>}
        </div>
        
        <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="duration">Duration (days)</Label>
              <Input id="duration" type="number" {...register('duration')} placeholder="e.g., 7" />
              {errors.duration && <p className="text-destructive text-sm mt-1">{errors.duration.message}</p>}
            </div>
            <div>
              <Label htmlFor="quantity">Total Quantity</Label>
              <Input id="quantity" type="number" {...register('quantity')} placeholder="e.g., 21" />
              {errors.quantity && <p className="text-destructive text-sm mt-1">{errors.quantity.message}</p>}
            </div>
        </div>

        <div>
          <Label htmlFor="description">AI Description (optional)</Label>
          <Textarea id="description" {...register('description')} disabled placeholder="AI-generated description will appear here" />
        </div>

        <Button type="submit" size="lg" className="w-full rounded-full">Add Medicine</Button>
      </div>
    </form>
  );
}
