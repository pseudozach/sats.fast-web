import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const MAX_USERS = 12;

export async function GET() {
  try {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      return NextResponse.json({ users: [] });
    }

    const supabase = createClient(url, key);
    const { data, error } = await supabase
      .from('users')
      .select('username, created_at')
      .order('created_at', { ascending: false })
      .limit(MAX_USERS);

    if (error || !data) {
      console.error('Failed to fetch recent users:', error?.message);
      return NextResponse.json({ users: [] });
    }

    const domain = process.env.DOMAIN || 'sats.fast';
    const users = data.map((u) => ({
      username: u.username,
      address: `${u.username}@${domain}`,
      createdAt: u.created_at,
    }));

    return NextResponse.json(
      { users },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching recent users:', error);
    return NextResponse.json({ users: [] });
  }
}
