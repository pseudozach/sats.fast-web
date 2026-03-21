import { createClient, SupabaseClient } from '@supabase/supabase-js';

export type UserRow = {
  id: string;
  username: string;
  spark_public_key: string;
  liquid_address: string | null;
  created_at: string;
};

let _client: SupabaseClient | null = null;
let _migrated = false;

function getClient(): SupabaseClient {
  if (_client) return _client;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  }
  _client = createClient(url, key);
  return _client;
}

// Check tables exist on first call — logs if missing
async function ensureSchema(): Promise<void> {
  if (_migrated) return;
  const supabase = getClient();

  const { error } = await supabase.from('users').select('id').limit(1);
  if (error && error.message.includes('does not exist')) {
    console.error(
      '\n⚠️  "users" table not found. Run the migration SQL in Supabase SQL Editor.\n'
    );
  }

  _migrated = true;
}

async function db(): Promise<SupabaseClient> {
  await ensureSchema();
  return getClient();
}

export async function getUserByUsername(username: string): Promise<UserRow | null> {
  const supabase = await db();
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('username', username)
    .single();

  if (error || !data) return null;
  return data as UserRow;
}

export async function getUserBySparkKey(sparkPublicKey: string): Promise<UserRow | null> {
  const supabase = await db();
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('spark_public_key', sparkPublicKey)
    .single();

  if (error || !data) return null;
  return data as UserRow;
}

export async function getUserByLiquidAddress(liquidAddress: string): Promise<UserRow | null> {
  const supabase = await db();
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('liquid_address', liquidAddress)
    .single();

  if (error || !data) return null;
  return data as UserRow;
}

export async function getConfigValue(key: string): Promise<string | null> {
  const supabase = await db();
  const { data, error } = await supabase
    .from('config')
    .select('value')
    .eq('key', key)
    .single();

  if (error || !data) return null;
  return data.value;
}

export async function setConfigValue(key: string, value: string): Promise<void> {
  const supabase = await db();
  await supabase
    .from('config')
    .upsert({ key, value }, { onConflict: 'key' });
}

export async function registerUser(
  username: string,
  sparkPublicKey: string,
  liquidAddress?: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await db();

  // Check if username is taken
  const existingUser = await getUserByUsername(username);
  if (existingUser) {
    return { success: false, error: 'Username is already taken' };
  }

  // Check if spark key is already registered
  const existingKey = await getUserBySparkKey(sparkPublicKey);
  if (existingKey) {
    return { success: false, error: 'This Spark address is already registered to another username' };
  }

  // Check if liquid address is already registered
  if (liquidAddress) {
    const existingLiquid = await getUserByLiquidAddress(liquidAddress);
    if (existingLiquid) {
      return { success: false, error: 'This Liquid address is already registered to another username' };
    }
  }

  const { error } = await supabase.from('users').insert({
    username,
    spark_public_key: sparkPublicKey,
    liquid_address: liquidAddress || null,
  });

  if (error) {
    console.error('Supabase insert error:', JSON.stringify(error));
    if (error.code === '23505') {
      return { success: false, error: 'Username or address already registered' };
    }
    return { success: false, error: `Database error: ${error.message || error.code || 'unknown'}` };
  }

  return { success: true };
}
