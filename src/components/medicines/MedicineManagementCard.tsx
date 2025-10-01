'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Medicine } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Clock, 
  Pill, 
  Edit, 
  Trash2, 
  StopCircle, 
  CheckCircle,
  AlertTriangle,
  Package
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { deleteMedicine, updateMedicine } from '@/services/mongodb';
import EditMedicineForm from './EditMedicineForm';

interface MedicineManagementCardProps {
  medicine: Medicine;
  remainingDays: number;
  totalDosesPerDay: number;
  totalDosesRemaining: number;
  isActive: boolean;
  onUpdate: () => void;
}

export default function MedicineManagementCard({
  medicine,
  remainingDays,
  totalDosesPerDay,
  totalDosesRemaining,
  isActive,
  onUpdate
}: MedicineManagementCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEnding, setIsEnding] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    if (!medicine._id) return;
    
    setIsDeleting(true);
    try {
      await deleteMedicine(medicine._id.toString());
      toast({
        title: "Medicine Deleted",
        description: `${medicine.name} has been removed from your medicines.`,
      });
      onUpdate();
    } catch (error) {
      toast({
        title: "Delete Failed",
        description: "Could not delete the medicine. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEndDose = async () => {
    if (!medicine._id) return;
    
    setIsEnding(true);
    try {
      // Mark medicine as completed by setting duration to 0
      await updateMedicine(medicine._id.toString(), {
        duration: 0,
        status: 'completed'
      });
      toast({
        title: "Dose Ended",
        description: `${medicine.name} has been marked as completed.`,
      });
      onUpdate();
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Could not end the dose. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsEnding(false);
    }
  };

  const getStatusBadge = () => {
    if (!isActive) {
      return <Badge variant="secondary" className="bg-gray-100 text-gray-800">Completed</Badge>;
    }
    if (remainingDays <= 3) {
      return <Badge variant="destructive" className="bg-red-100 text-red-800">Ending Soon</Badge>;
    }
    if (remainingDays <= 7) {
      return <Badge variant="outline" className="border-orange-300 text-orange-800">Low Stock</Badge>;
    }
    return <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>;
  };

  const getQuantityStatus = () => {
    const remainingPercentage = (medicine.quantity / (totalDosesRemaining + medicine.quantity)) * 100;
    
    if (remainingPercentage <= 20) {
      return { color: 'text-red-600', icon: AlertTriangle, text: 'Low Stock' };
    } else if (remainingPercentage <= 50) {
      return { color: 'text-orange-600', icon: AlertTriangle, text: 'Medium Stock' };
    } else {
      return { color: 'text-green-600', icon: CheckCircle, text: 'Good Stock' };
    }
  };

  const quantityStatus = getQuantityStatus();
  const QuantityIcon = quantityStatus.icon;

  return (
    <>
    <Card className={`${!isActive ? 'opacity-75' : ''}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Image
              src={medicine.photoUrl}
              alt={medicine.name}
              width={48}
              height={48}
              className="rounded-md object-cover"
            />
            <div>
              <CardTitle className="text-lg">{medicine.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{medicine.use}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge()}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Medicine Details */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Pill className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Dosage:</span>
            <span>{medicine.dosage}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Timing:</span>
            <span className="capitalize">{medicine.timing.replace('-', ' ')}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Duration:</span>
            <span>{medicine.duration} days</span>
          </div>
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Quantity:</span>
            <span>{medicine.quantity}</span>
          </div>
        </div>

        {/* Schedule */}
        <div>
          <h4 className="font-medium text-sm mb-2">Schedule Times:</h4>
          <div className="flex flex-wrap gap-2">
            {medicine.schedule.map((time, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {time}
              </Badge>
            ))}
          </div>
        </div>

        {/* Progress Tracking */}
        {isActive && (
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Progress Tracking:</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-lg font-bold text-blue-600">{remainingDays}</div>
                <div className="text-xs text-blue-800">Days Remaining</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-lg font-bold text-green-600">{totalDosesPerDay}</div>
                <div className="text-xs text-green-800">Doses/Day</div>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <div className="text-lg font-bold text-orange-600">{totalDosesRemaining}</div>
                <div className="text-xs text-orange-800">Total Remaining</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className={`text-lg font-bold ${quantityStatus.color}`}>
                  <QuantityIcon className="h-5 w-5 mx-auto" />
                </div>
                <div className={`text-xs ${quantityStatus.color}`}>{quantityStatus.text}</div>
              </div>
            </div>
          </div>
        )}

        {/* Description */}
        {medicine.description && (
          <div>
            <h4 className="font-medium text-sm mb-1">Description:</h4>
            <p className="text-sm text-muted-foreground">{medicine.description}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 pt-4 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowEditForm(true)}
            className="flex items-center gap-2"
          >
            <Edit className="h-4 w-4" />
            Edit
          </Button>

          {isActive && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 text-orange-600 hover:text-orange-700"
                >
                  <StopCircle className="h-4 w-4" />
                  End Dose
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>End Medicine Dose</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to end the dose for {medicine.name}? 
                    This will mark the medicine as completed and stop all future reminders.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleEndDose}
                    disabled={isEnding}
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    {isEnding ? 'Ending...' : 'End Dose'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2 text-red-600 hover:text-red-700"
                disabled={isDeleting}
              >
                <Trash2 className="h-4 w-4" />
                {isDeleting ? 'Deleting...' : 'Delete'}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Medicine</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete {medicine.name}? This action cannot be undone.
                  All associated data and history will be permanently removed.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>

    {/* Edit Form Modal */}
    {showEditForm && (
      <EditMedicineForm
        medicine={medicine}
        onClose={() => setShowEditForm(false)}
        onSuccess={onUpdate}
      />
    )}
    </>
  );
}
