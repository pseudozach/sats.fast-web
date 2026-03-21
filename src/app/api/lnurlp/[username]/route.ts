import { NextRequest, NextResponse } from 'next/server';
import { getUserByUsername } from '@/lib/supabase';
import { validateUsername, LIMITS } from '@/lib/validation';

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

    if (!user || !user.spark_public_key) {
      return NextResponse.json(
        { status: 'ERROR', reason: `Lightning address not found for ${username}` },
        { status: 404 }
      );
    }

    // LUD-06/LUD-16 compliant discovery response
    const response = {
      callback: `https://${DOMAIN}/lnurl/payreq/${username}`,
      maxSendable: LIMITS.MAX_AMOUNT_SATS * 1000,
      minSendable: LIMITS.MIN_AMOUNT_MSAT,
      metadata: JSON.stringify([
        ['text/identifier', `${username}@${DOMAIN}`],
        ['text/plain', `Pay @${username}`],
      ]),
      tag: 'payRequest',
      commentAllowed: LIMITS.MAX_COMMENT_LENGTH,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in LNURL-pay discovery:', error);
    return NextResponse.json(
      { status: 'ERROR', reason: 'Internal server error' },
      { status: 500 }
    );
  }
}
