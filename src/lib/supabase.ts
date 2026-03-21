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

// Idempotent schema bootstrap — runs once per cold start, safe to re-run
async function ensureSchema(): Promise<void> {
  if (_migrated) return;
  const supabase = getClient();

  // Use raw SQL via rpc; requires a one-time Supabase function (below) OR
  // we can use the REST-compatible approach: just try to select from users.
  // If it fails, we create the table via the Supabase Management API / SQL.
  // Simplest: use supabase.rpc to execute raw SQL.
  // We create a helper function in Supabase if it doesn't exist, but that's
  // chicken-and-egg. Instead, just attempt a select — if the table doesn't
  // exist, create it via the postgres REST endpoint using service role.

  const { error } = await supabase.from('users').select('id').limit(1);

  if (error && error.message.includes('relation') && error.message.includes('does not exist')) {
    // Table doesn't exist — create it via raw SQL
    const sql = `
      create table if not exists public.users (
        id uuid default gen_random_uuid() primary key,
        username text not null,
        spark_public_key text not null,
        liquid_address text,
        created_at timestamp with time zone default now()
      );
      create unique index if not exists users_username_unique on public.users (lower(username));
      create unique index if not exists users_spark_public_key_unique on public.users (spark_public_key);
      create unique index if not exists users_liquid_address_unique on public.users (liquid_address) where liquid_address is not null;
      create index if not exists users_username_idx on public.users (lower(username));

      create table if not exists public.config (
        key text primary key,
        value text not null,
        created_at timestamp with time zone default now()
      );
    `;

    const res = await fetch(`${process.env.SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`,
      },
      body: JSON.stringify({ query: sql }),
    });

    if (!res.ok) {
      // Fallback: try creating via the Supabase SQL endpoint (pg-meta)
      const pgRes = await fetch(`${process.env.SUPABASE_URL}/pg/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`,
        },
        body: JSON.stringify({ query: sql }),
      });

      if (!pgRes.ok) {
        console.error(
          'Auto-migration failed. Please run this SQL in Supabase SQL editor:\n' + sql
        );
        // Don't throw — table might already exist via another path
      }
    }
  } else {
    // Also ensure config table exists (best-effort)
    const { error: cfgErr } = await supabase.from('config').select('key').limit(1);
    if (cfgErr && cfgErr.message.includes('does not exist')) {
      // Try to create config table
      try {
        const sql = `create table if not exists public.config (key text primary key, value text not null, created_at timestamp with time zone default now());`;
        await fetch(`${process.env.SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
            Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`,
          },
          body: JSON.stringify({ query: sql }),
        });
      } catch {
        // best-effort
      }
    }
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
    if (error.code === '23505') {
      return { success: false, error: 'Username or address already registered' };
    }
    console.error('Supabase insert error:', error);
    return { success: false, error: 'Registration failed. Please try again.' };
  }

  return { success: true };
}
