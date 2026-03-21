import { NextRequest, NextResponse } from 'next/server';
import { registerUser } from '@/lib/supabase';
import {
  validateUsername,
  validateSparkPublicKey,
  validateLiquidAddress,
} from '@/lib/validation';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, sparkPublicKey, liquidAddress } = body;

    // Validate username
    const usernameValidation = validateUsername(username);
    if (!usernameValidation.valid) {
      return NextResponse.json(
        { success: false, error: usernameValidation.error },
        { status: 400 }
      );
    }

    // Validate spark public key
    const sparkValidation = validateSparkPublicKey(sparkPublicKey);
    if (!sparkValidation.valid) {
      return NextResponse.json(
        { success: false, error: sparkValidation.error },
        { status: 400 }
      );
    }

    // Validate liquid address if provided
    if (liquidAddress) {
      const liquidValidation = validateLiquidAddress(liquidAddress);
      if (!liquidValidation.valid) {
        return NextResponse.json(
          { success: false, error: liquidValidation.error },
          { status: 400 }
        );
      }
    }

    // Register the user
    const result = await registerUser(
      username.trim().toLowerCase(),
      sparkPublicKey.trim(),
      liquidAddress?.trim() || undefined
    );

    if (!result.success) {
      const isConflict = result.error?.includes('already');
      return NextResponse.json(
        { success: false, error: result.error },
        { status: isConflict ? 409 : 500 }
      );
    }

    const domain = process.env.DOMAIN || 'sats.fast';

    return NextResponse.json({
      success: true,
      lightningAddress: `${username.toLowerCase()}@${domain}`,
      message: `Your lightning address is ${username.toLowerCase()}@${domain}`,
    });
  } catch (error) {
    console.error('Error in registration:', error);
    return NextResponse.json(
      { success: false, error: 'Registration failed. Please try again.' },
      { status: 500 }
    );
  }
}
