'use client';

import { useState, useEffect } from 'react';
import { Medicine } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { updateMedicine } from '@/services/mongodb';
import { Trash2, PlusCircle, Clock } from 'lucide-react';

interface EditMedicineFormProps {
  medicine: Medicine;
  onClose: () => void;
  onSuccess: () => void;
}

const defaultSchedules = [
  { id: 'morning', label: 'Morning', time: '09:00' },
  { id: 'noon', label: 'Noon', time: '14:00' },
  { id: 'evening', label: 'Evening', time: '21:00' },
];

export default function EditMedicineForm({ medicine, onClose, onSuccess }: EditMedicineFormProps) {
  const [formData, setFormData] = useState({
    name: medicine.name,
    dosage: medicine.dosage,
    timing: medicine.timing,
    use: medicine.use,
    description: medicine.description,
    schedule: [...medicine.schedule],
    duration: medicine.duration,
    quantity: medicine.quantity,
  });

  const [scheduleTimings, setScheduleTimings] = useState([
    ...defaultSchedules,
    ...medicine.schedule
      .filter(time => !defaultSchedules.some(ds => ds.time === time))
      .map((time, index) => ({
        id: `custom-${index}`,
        label: 'Custom',
        time: time
      }))
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleTimeChange = (id: string, newTime: string) => {
    setScheduleTimings(prev => 
      prev.map(item => 
        item.id === id ? { ...item, time: newTime } : item
      )
    );
  };

  const handleAddTime = () => {
    const newId = `custom-${Date.now()}`;
    setScheduleTimings(prev => [...prev, { id: newId, label: 'Custom', time: '12:00' }]);
  };

  const handleRemoveTime = (timeToRemove: string) => {
    setScheduleTimings(prev => prev.filter(item => item.time !== timeToRemove));
    setFormData(prev => ({
      ...prev,
      schedule: prev.schedule.filter(time => time !== timeToRemove)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!medicine._id) {
      toast({
        title: "Error",
        description: "Medicine ID not found.",
        variant: "destructive",
      });
      return;
    }

    if (formData.schedule.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please select at least one schedule time.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await updateMedicine(medicine._id.toString(), {
        name: formData.name,
        dosage: formData.dosage,
        timing: formData.timing,
        use: formData.use,
        description: formData.description,
        schedule: formData.schedule,
        duration: formData.duration,
        quantity: formData.quantity,
      });

      toast({
        title: "Medicine Updated",
        description: `${formData.name} has been updated successfully.`,
      });

      onSuccess();
      onClose();
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Could not update the medicine. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Edit Medicine
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Medicine Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="dosage">Dosage</Label>
                <Input
                  id="dosage"
                  value={formData.dosage}
                  onChange={(e) => setFormData(prev => ({ ...prev, dosage: e.target.value }))}
                  placeholder="e.g., 1-0-1"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="timing">Timing</Label>
                <Select
                  value={formData.timing}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, timing: value as any }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="before-food">Before Food</SelectItem>
                    <SelectItem value="after-food">After Food</SelectItem>
                    <SelectItem value="any">Any Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="use">Use/Purpose</Label>
                <Input
                  id="use"
                  value={formData.use}
                  onChange={(e) => setFormData(prev => ({ ...prev, use: e.target.value }))}
                  placeholder="e.g., For headache"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Additional notes about this medicine"
                rows={3}
              />
            </div>

            {/* Schedule */}
            <div>
              <Label>Schedule Times</Label>
              <div className="mt-2 space-y-2">
                {scheduleTimings.map(item => (
                  <div key={item.id} className="flex items-center gap-2 p-2 border rounded-md">
                    <Checkbox
                      id={item.id}
                      checked={formData.schedule.includes(item.time)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setFormData(prev => ({
                            ...prev,
                            schedule: [...prev.schedule, item.time]
                          }));
                        } else {
                          setFormData(prev => ({
                            ...prev,
                            schedule: prev.schedule.filter(time => time !== item.time)
                          }));
                        }
                      }}
                    />
                    <Label htmlFor={item.id} className="flex-1 cursor-pointer">
                      {item.id.startsWith('custom-') ? 'Custom' : item.label}
                    </Label>
                    <Input
                      type="time"
                      value={item.time}
                      onChange={(e) => handleTimeChange(item.id, e.target.value)}
                      className="w-[120px]"
                    />
                    {item.id.startsWith('custom-') && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleRemoveTime(item.time)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddTime}
                  className="w-full flex items-center gap-2"
                >
                  <PlusCircle className="h-4 w-4" />
                  Add Custom Time
                </Button>
              </div>
            </div>

            {/* Duration and Quantity */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="duration">Duration (Days)</Label>
                <Input
                  id="duration"
                  type="number"
                  min="1"
                  value={formData.duration}
                  onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) || 1 }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                  required
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? 'Updating...' : 'Update Medicine'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

