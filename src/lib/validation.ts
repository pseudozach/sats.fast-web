const MAX_USERNAME_LENGTH = 50;
const MAX_AMOUNT_SATS = 10_000_000; // 0.1 BTC
const MIN_AMOUNT_MSAT = 1_000; // 1 sat minimum

export function validateUsername(username: string): { valid: boolean; error?: string } {
  if (!username || typeof username !== 'string') {
    return { valid: false, error: 'Username is required' };
  }

  const trimmed = username.trim().toLowerCase();

  if (trimmed.length < 1 || trimmed.length > MAX_USERNAME_LENGTH) {
    return { valid: false, error: `Username must be 1-${MAX_USERNAME_LENGTH} characters` };
  }

  if (!/^[a-z0-9_-]+$/.test(trimmed)) {
    return { valid: false, error: 'Username can only contain lowercase letters, numbers, underscore, and hyphen' };
  }

  // Reserved words
  const reserved = ['admin', 'api', 'well-known', 'lnurl', 'liquid', 'health', 'claim', 'register'];
  if (reserved.includes(trimmed)) {
    return { valid: false, error: 'This username is reserved' };
  }

  return { valid: true };
}

export function validateAmount(amount: string | null): { valid: boolean; amountSats?: number; error?: string } {
  if (!amount) {
    return { valid: false, error: 'Amount is required' };
  }

  const amountNum = parseInt(amount, 10);

  if (isNaN(amountNum) || amountNum < MIN_AMOUNT_MSAT) {
    return { valid: false, error: `Amount must be at least ${MIN_AMOUNT_MSAT} millisatoshis` };
  }

  const amountSats = Math.floor(amountNum / 1000);
  if (amountSats > MAX_AMOUNT_SATS) {
    return { valid: false, error: `Amount too large (max ${MAX_AMOUNT_SATS} sats)` };
  }

  return { valid: true, amountSats };
}

export function sanitizeComment(comment: string | null): string | null {
  if (!comment) return null;
  return comment
    .replace(/[<>'"]/g, '')
    .replace(/;|--|\/\*|\*\//g, '')
    .substring(0, 500)
    .trim();
}

export function validateSparkPublicKey(key: string): { valid: boolean; error?: string } {
  if (!key || typeof key !== 'string') {
    return { valid: false, error: 'Spark public key is required' };
  }

  const trimmed = key.trim();

  // Spark public keys are hex-encoded - typically 66 chars (compressed) or 130 chars (uncompressed)
  if (!/^[0-9a-fA-F]{64,130}$/.test(trimmed)) {
    return { valid: false, error: 'Invalid Spark public key format' };
  }

  return { valid: true };
}

export function validateLiquidAddress(address: string): { valid: boolean; error?: string } {
  if (!address || typeof address !== 'string') {
    return { valid: false, error: 'Liquid address is required' };
  }

  const trimmed = address.trim();

  // Liquid addresses: confidential (blech32) start with lq1/ex1 or VJL/VTp (base58)
  // or unconfidential start with Q/G/H (base58) or ert1 (bech32 for elements regtest)
  if (trimmed.length < 20 || trimmed.length > 120) {
    return { valid: false, error: 'Invalid Liquid address length' };
  }

  if (!/^[a-zA-Z0-9]+$/.test(trimmed)) {
    return { valid: false, error: 'Liquid address contains invalid characters' };
  }

  return { valid: true };
}

export const LIMITS = {
  MAX_USERNAME_LENGTH,
  MAX_AMOUNT_SATS,
  MIN_AMOUNT_MSAT,
  MAX_COMMENT_LENGTH: 0,
};
