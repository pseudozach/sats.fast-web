import { NextRequest, NextResponse } from 'next/server';
import { getUserByUsername } from '@/lib/supabase';
import { validateUsername } from '@/lib/validation';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;

    const validation = validateUsername(username);
    if (!validation.valid) {
      return NextResponse.json(
        { status: 'ERROR', reason: validation.error },
        { status: 400 }
      );
    }

    const user = await getUserByUsername(username.toLowerCase());

    if (!user || !user.liquid_address) {
      return NextResponse.json(
        { status: 'ERROR', reason: `Liquid address not found for ${username}` },
        { status: 404 }
      );
    }

    // Return the liquid address in the "pr" field (analogous to LNURL-pay response)
    // Other sats.fast agents will read this to know where to send L-BTC / USDT
    return NextResponse.json({
      pr: user.liquid_address,
      successAction: null,
      disposable: true,
      routes: [],
    });
  } catch (error) {
    console.error('Error in Liquid payreq:', error);
    return NextResponse.json(
      { status: 'ERROR', reason: 'Internal server error' },
      { status: 500 }
    );
  }
}
