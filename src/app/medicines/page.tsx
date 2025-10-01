'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getMedicines } from '@/services/mongodb';
import { Medicine } from '@/lib/types';
import AppLayout from '@/components/AppLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Skeleton } from '@/components/ui/skeleton';
import MedicineManagementCard from '@/components/medicines/MedicineManagementCard';
import { Button } from '@/components/ui/button';
import { Plus, Filter } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

function MedicinesContent() {
  const { user } = useAuth();
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const router = useRouter();

  useEffect(() => {
    if (user) {
      const fetchMedicines = async () => {
        setLoading(true);
        const medicinesData = await getMedicines(user.uid);
        setMedicines(medicinesData);
        setLoading(false);
      };
      fetchMedicines();
    }
  }, [user]);

  const filteredMedicines = medicines.filter(medicine => {
    const matchesSearch = medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         medicine.use.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterStatus === 'all') return matchesSearch;
    if (filterStatus === 'active') return matchesSearch && isMedicineActive(medicine);
    if (filterStatus === 'completed') return matchesSearch && !isMedicineActive(medicine);
    
    return matchesSearch;
  });

  const isMedicineActive = (medicine: Medicine) => {
    const now = new Date();
    const startDate = new Date(medicine.createdAt);
    const endDate = new Date(startDate.getTime() + (medicine.duration * 24 * 60 * 60 * 1000));
    return now <= endDate;
  };

  const getRemainingDays = (medicine: Medicine) => {
    const now = new Date();
    const startDate = new Date(medicine.createdAt);
    const endDate = new Date(startDate.getTime() + (medicine.duration * 24 * 60 * 60 * 1000));
    const remaining = Math.ceil((endDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
    return Math.max(0, remaining);
  };

  const getTotalDosesPerDay = (medicine: Medicine) => {
    return medicine.schedule.length;
  };

  const getTotalDosesRemaining = (medicine: Medicine) => {
    const remainingDays = getRemainingDays(medicine);
    const dosesPerDay = getTotalDosesPerDay(medicine);
    return remainingDays * dosesPerDay;
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="grid gap-4">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold font-headline">Medicine Management</h1>
            <p className="text-muted-foreground">Manage your medicines, track quantities, and monitor progress</p>
          </div>
          <Button 
            onClick={() => router.push('/add-medicine')}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Medicine
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search medicines..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Medicines</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg border">
            <h3 className="font-semibold text-blue-900">Total Medicines</h3>
            <p className="text-2xl font-bold text-blue-600">{medicines.length}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border">
            <h3 className="font-semibold text-green-900">Active Medicines</h3>
            <p className="text-2xl font-bold text-green-600">
              {medicines.filter(isMedicineActive).length}
            </p>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg border">
            <h3 className="font-semibold text-orange-900">Total Doses Today</h3>
            <p className="text-2xl font-bold text-orange-600">
              {medicines.filter(isMedicineActive).reduce((sum, med) => sum + getTotalDosesPerDay(med), 0)}
            </p>
          </div>
        </div>

        {/* Medicines List */}
        <div className="space-y-4">
          {filteredMedicines.length === 0 ? (
            <div className="text-center py-12">
              <Filter className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No medicines found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || filterStatus !== 'all' 
                  ? 'Try adjusting your search or filter criteria'
                  : 'Start by adding your first medicine'
                }
              </p>
              {!searchTerm && filterStatus === 'all' && (
                <Button onClick={() => router.push('/add-medicine')}>
                  Add Your First Medicine
                </Button>
              )}
            </div>
          ) : (
            filteredMedicines.map(medicine => (
              <MedicineManagementCard
                key={medicine._id?.toString()}
                medicine={medicine}
                remainingDays={getRemainingDays(medicine)}
                totalDosesPerDay={getTotalDosesPerDay(medicine)}
                totalDosesRemaining={getTotalDosesRemaining(medicine)}
                isActive={isMedicineActive(medicine)}
                onUpdate={() => {
                  // Refresh medicines list
                  if (user) {
                    getMedicines(user.uid).then(setMedicines);
                  }
                }}
              />
            ))
          )}
        </div>
      </div>
    </AppLayout>
  );
}

export default function MedicinesPage() {
  return (
    <ProtectedRoute>
      <MedicinesContent />
    </ProtectedRoute>
  );
}

