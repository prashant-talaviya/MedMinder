'use server';

import { getDatabase } from '@/lib/mongodb';
import { User } from '@/lib/types';
import bcrypt from 'bcryptjs';
import { ObjectId } from 'mongodb';

export async function createUser(userData: {
  name: string;
  email: string;
  password: string;
}): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    const db = await getDatabase();
    
    // Check if user already exists
    const existingUser = await db.collection('users').findOne({ email: userData.email });
    if (existingUser) {
      return { success: false, error: 'User with this email already exists' };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 12);

    // Create user
    const user = {
      name: userData.name,
      email: userData.email,
      password: hashedPassword,
      avatarUrl: `https://i.pravatar.cc/150?u=${userData.email}`,
      createdAt: new Date(),
    };

    const result = await db.collection('users').insertOne(user);
    
    // Return user without password
    const { password, ...userWithoutPassword } = user;
    const newUser: User = {
      uid: result.insertedId.toString(),
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
    };

    return { success: true, user: newUser };
  } catch (error) {
    console.error('Error creating user:', error);
    return { success: false, error: 'Failed to create user' };
  }
}

export async function authenticateUser(email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    const db = await getDatabase();
    
    // Find user by email
    const user = await db.collection('users').findOne({ email });
    if (!user) {
      return { success: false, error: 'Invalid email or password' };
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return { success: false, error: 'Invalid email or password' };
    }

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    const userData: User = {
      uid: user._id.toString(),
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
    };

    return { success: true, user: userData };
  } catch (error) {
    console.error('Error authenticating user:', error);
    return { success: false, error: 'Failed to authenticate user' };
  }
}

export async function getUserById(userId: string): Promise<User | null> {
  try {
    const db = await getDatabase();
    const user = await db.collection('users').findOne({ _id: new ObjectId(userId) });
    
    if (!user) return null;

    const { password, ...userWithoutPassword } = user;
    return {
      uid: user._id.toString(),
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
    };
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
}

export async function updateUser(userId: string, updates: {
  name?: string;
  email?: string;
  avatarUrl?: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const db = await getDatabase();
    
    // Check if email is being changed and if it already exists
    if (updates.email) {
      const existingUser = await db.collection('users').findOne({ 
        email: updates.email,
        _id: { $ne: new ObjectId(userId) }
      });
      
      if (existingUser) {
        return { success: false, error: 'Email already exists' };
      }
    }

    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(userId) },
      { $set: updates }
    );

    if (result.matchedCount === 0) {
      return { success: false, error: 'User not found' };
    }

    return { success: true };
  } catch (error) {
    console.error('Error updating user:', error);
    return { success: false, error: 'Failed to update user' };
  }
}

export async function changePassword(userId: string, currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
  try {
    const db = await getDatabase();
    
    // Find user and verify current password
    const user = await db.collection('users').findOne({ _id: new ObjectId(userId) });
    if (!user) {
      return { success: false, error: 'User not found' };
    }

    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      return { success: false, error: 'Current password is incorrect' };
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    await db.collection('users').updateOne(
      { _id: new ObjectId(userId) },
      { $set: { password: hashedNewPassword } }
    );

    return { success: true };
  } catch (error) {
    console.error('Error changing password:', error);
    return { success: false, error: 'Failed to change password' };
  }
}

export async function deleteAccount(userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const db = await getDatabase();
    
    // Delete user and all associated data
    await Promise.all([
      db.collection('users').deleteOne({ _id: new ObjectId(userId) }),
      db.collection('medicines').deleteMany({ userId }),
      db.collection('history').deleteMany({ userId }),
      db.collection('userStats').deleteMany({ userId }),
    ]);

    return { success: true };
  } catch (error) {
    console.error('Error deleting account:', error);
    return { success: false, error: 'Failed to delete account' };
  }
}
