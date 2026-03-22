import { generateSecretKey, getPublicKey, verifyEvent } from 'nostr-tools';
import { getConfigValue, setConfigValue } from '@/lib/supabase';

let _cachedPubkey: string | null = null;

/**
 * Get (or auto-generate) the server's nostr keypair for signing zap receipts.
 * Private key is stored in Supabase config table as 'nostr_privkey'.
 * Returns the x-only public key (BIP 340, 64 hex chars).
 */
export async function getNostrPubkey(): Promise<string> {
  if (_cachedPubkey) return _cachedPubkey;

  // 1. Check env var override
  if (process.env.NOSTR_PRIVKEY) {
    const pubkey = getPublicKey(hexToBytes(process.env.NOSTR_PRIVKEY));
    _cachedPubkey = pubkey;
    return pubkey;
  }

  // 2. Check Supabase config for previously generated key
  const stored = await getConfigValue('nostr_privkey');
  if (stored) {
    const pubkey = getPublicKey(hexToBytes(stored));
    _cachedPubkey = pubkey;
    return pubkey;
  }

  // 3. Auto-generate a new keypair and store the private key
  const sk = generateSecretKey();
  const privkeyHex = bytesToHex(sk);
  await setConfigValue('nostr_privkey', privkeyHex);
  const pubkey = getPublicKey(sk);
  _cachedPubkey = pubkey;
  console.log('Generated and stored new nostr server keypair for zap receipts');
  return pubkey;
}

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Validate a NIP-57 zap request event (kind 9734).
 * Returns { valid, error? }.
 */
export function validateZapRequest(
  nostrParam: string,
  amountMsat: number
): { valid: boolean; error?: string } {
  try {
    const event = JSON.parse(nostrParam);

    // Must be kind 9734
    if (event.kind !== 9734) {
      return { valid: false, error: 'Zap request must be kind 9734' };
    }

    // Must have tags
    if (!Array.isArray(event.tags) || event.tags.length === 0) {
      return { valid: false, error: 'Zap request must have tags' };
    }

    // Must have exactly one p tag
    const pTags = event.tags.filter((t: string[]) => t[0] === 'p');
    if (pTags.length !== 1) {
      return { valid: false, error: 'Zap request must have exactly one p tag' };
    }

    // Must have 0 or 1 e tags
    const eTags = event.tags.filter((t: string[]) => t[0] === 'e');
    if (eTags.length > 1) {
      return { valid: false, error: 'Zap request must have 0 or 1 e tags' };
    }

    // If amount tag present, must match the amount query param
    const amountTag = event.tags.find((t: string[]) => t[0] === 'amount');
    if (amountTag && parseInt(amountTag[1], 10) !== amountMsat) {
      return { valid: false, error: 'Zap request amount does not match' };
    }

    // Should have relays tag
    const relaysTag = event.tags.find((t: string[]) => t[0] === 'relays');
    if (!relaysTag) {
      return { valid: false, error: 'Zap request should include relays tag' };
    }

    // Verify event signature using nostr-tools
    if (!verifyEvent(event)) {
      return { valid: false, error: 'Invalid zap request signature' };
    }

    return { valid: true };
  } catch {
    return { valid: false, error: 'Invalid zap request JSON' };
  }
}
