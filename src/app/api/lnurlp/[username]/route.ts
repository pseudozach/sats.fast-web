import { NextRequest, NextResponse } from 'next/server';
import { getUserByUsername } from '@/lib/supabase';
import { validateUsername, LIMITS } from '@/lib/validation';
import { getNostrPubkey } from '@/lib/nostr';

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

    // Get server nostr pubkey for NIP-57 zap support
    let nostrPubkey: string | undefined;
    try {
      nostrPubkey = await getNostrPubkey();
    } catch (err) {
      console.error('Failed to get nostr pubkey (zaps disabled):', err);
    }

    // LUD-06/LUD-16 compliant discovery response
    const response: Record<string, unknown> = {
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

    // NIP-57: advertise zap support if nostr key is available
    if (nostrPubkey) {
      response.allowsNostr = true;
      response.nostrPubkey = nostrPubkey;
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in LNURL-pay discovery:', error);
    return NextResponse.json(
      { status: 'ERROR', reason: 'Internal server error' },
      { status: 500 }
    );
  }
}
