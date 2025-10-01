import { NextRequest, NextResponse } from 'next/server';
import { updateUser } from '@/services/auth';

export async function PUT(request: NextRequest) {
  try {
    const { userId, updates } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    const result = await updateUser(userId, updates);

    if (result.success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Update profile API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

