import { NextRequest, NextResponse } from 'next/server';
import { getUserByUsername } from '@/lib/supabase';
import { validateUsername } from '@/lib/validation';

const DOMAIN = process.env.DOMAIN || 'sats.fast';

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

    // Return discovery response for Liquid address
    return NextResponse.json({
      username: user.username,
      liquidAddress: user.liquid_address,
      domain: DOMAIN,
      callback: `https://${DOMAIN}/liquid/payreq/${username}`,
      tag: 'liquidPayRequest',
    });
  } catch (error) {
    console.error('Error in Liquid address discovery:', error);
    return NextResponse.json(
      { status: 'ERROR', reason: 'Internal server error' },
      { status: 500 }
    );
  }
}
