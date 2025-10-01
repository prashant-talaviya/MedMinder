'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { User } from '@/lib/types';
import AppLayout from '@/components/AppLayout';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  User as UserIcon, 
  Mail, 
  Calendar, 
  Camera, 
  Save, 
  Edit3,
  Shield,
  Key,
  Trash2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
// API calls will be made directly in the component
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

export default function ProfilePage() {
  const { user, logout, updateUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    avatarUrl: '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl || '',
      });
      setLoading(false);
    }
  }, [user]);

  const handleSaveProfile = async () => {
    if (!user) return;

    try {
      const response = await fetch('/api/profile/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.uid,
          updates: {
            name: formData.name,
            email: formData.email,
            avatarUrl: formData.avatarUrl,
          },
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Update the user context with the new data
        updateUser({
          name: formData.name,
          email: formData.email,
          avatarUrl: formData.avatarUrl,
        });

        toast({
          title: "Profile Updated",
          description: "Your profile has been updated successfully.",
        });
        setIsEditing(false);
      } else {
        toast({
          title: "Update Failed",
          description: data.error || "Could not update your profile.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Could not update your profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleChangePassword = async () => {
    if (!user) return;

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "New password and confirmation do not match.",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch('/api/profile/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.uid,
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Password Changed",
          description: "Your password has been changed successfully.",
        });

        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
        setIsChangingPassword(false);
      } else {
        toast({
          title: "Password Change Failed",
          description: data.error || "Could not change your password.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Password Change Failed",
        description: "Could not change your password. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;

    try {
      const response = await fetch('/api/profile/delete-account', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.uid,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Account Deleted",
          description: "Your account has been permanently deleted.",
        });
        logout();
      } else {
        toast({
          title: "Delete Failed",
          description: data.error || "Could not delete your account.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Delete Failed",
        description: "Could not delete your account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-64 w-full" />
        </div>
      </AppLayout>
    );
  }

  if (!user) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-4">Profile Not Found</h1>
          <p className="text-muted-foreground">Please log in to view your profile.</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold font-headline">Profile Settings</h1>
            <p className="text-muted-foreground">Manage your account information and preferences</p>
          </div>
          {!isEditing && (
            <Button onClick={() => setIsEditing(true)} className="flex items-center gap-2">
              <Edit3 className="h-4 w-4" />
              Edit Profile
            </Button>
          )}
        </div>

        {/* Profile Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserIcon className="h-5 w-5" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar Section */}
            <div className="flex items-center gap-6">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={formData.avatarUrl} alt={user.name} />
                  <AvatarFallback className="text-lg">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <Button
                    size="sm"
                    className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full"
                    onClick={() => {
                      const newUrl = prompt('Enter new avatar URL (e.g., https://example.com/photo.jpg):');
                      if (newUrl && newUrl.trim()) {
                        // Basic URL validation
                        try {
                          new URL(newUrl);
                          setFormData(prev => ({ ...prev, avatarUrl: newUrl.trim() }));
                        } catch {
                          toast({
                            title: "Invalid URL",
                            description: "Please enter a valid image URL.",
                            variant: "destructive",
                          });
                        }
                      }
                    }}
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <div>
                <h3 className="text-xl font-semibold">{user.name}</h3>
                <p className="text-muted-foreground">{user.email}</p>
                {isEditing && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Click the camera icon to change your avatar
                  </p>
                )}
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  disabled={!isEditing}
                />
              </div>
            </div>

            {/* Avatar URL Field */}
            {isEditing && (
              <div>
                <Label htmlFor="avatarUrl">Avatar URL</Label>
                <Input
                  id="avatarUrl"
                  type="url"
                  value={formData.avatarUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, avatarUrl: e.target.value }))}
                  placeholder="https://example.com/your-photo.jpg"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Enter a direct link to your profile image
                </p>
              </div>
            )}

            {/* Action Buttons */}
            {isEditing && (
              <div className="flex gap-3">
                <Button onClick={handleSaveProfile} className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Save Changes
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({
                      name: user.name,
                      email: user.email,
                      avatarUrl: user.avatarUrl || '',
                    });
                  }}
                >
                  Cancel
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isChangingPassword ? (
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Key className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <h4 className="font-medium">Password</h4>
                    <p className="text-sm text-muted-foreground">Change your account password</p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => setIsChangingPassword(true)}
                >
                  Change Password
                </Button>
              </div>
            ) : (
              <div className="space-y-4 p-4 border rounded-lg">
                <h4 className="font-medium">Change Password</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button onClick={handleChangePassword} className="flex items-center gap-2">
                    <Key className="h-4 w-4" />
                    Update Password
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setIsChangingPassword(false);
                      setPasswordData({
                        currentPassword: '',
                        newPassword: '',
                        confirmPassword: '',
                      });
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Account Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Account Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">User</div>
                <div className="text-sm text-blue-800">Account Type</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">Active</div>
                <div className="text-sm text-green-800">Account Status</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {user.uid.slice(-4).toUpperCase()}
                </div>
                <div className="text-sm text-purple-800">User ID</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="h-5 w-5" />
              Danger Zone
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
              <div>
                <h4 className="font-medium text-red-900">Delete Account</h4>
                <p className="text-sm text-red-700">
                  Permanently delete your account and all associated data. This action cannot be undone.
                </p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="destructive" 
                    disabled={isDeleting}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {isDeleting ? 'Deleting...' : 'Delete Account'}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Account</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete your account? This will permanently remove:
                      <br />• All your medicines and schedules
                      <br />• Your medicine history and statistics
                      <br />• All your personal data
                      <br /><br />
                      This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteAccount}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Yes, Delete My Account
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
