import { NextRequest, NextResponse } from 'next/server';
import { changePassword } from '@/services/auth';

export async function POST(request: NextRequest) {
  try {
    const { userId, currentPassword, newPassword } = await request.json();

    if (!userId || !currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, error: 'All fields are required' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    const result = await changePassword(userId, currentPassword, newPassword);

    if (result.success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Change password API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

