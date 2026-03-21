import { NextRequest, NextResponse } from 'next/server';
import { getUserByUsername } from '@/lib/supabase';
import { createInvoiceForUser } from '@/lib/spark';
import { validateUsername, validateAmount, sanitizeComment } from '@/lib/validation';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;
    const searchParams = request.nextUrl.searchParams;
    const amount = searchParams.get('amount');
    const comment = searchParams.get('comment');

    // Validate username
    const usernameValidation = validateUsername(username);
    if (!usernameValidation.valid) {
      return NextResponse.json(
        { status: 'ERROR', reason: usernameValidation.error },
        { status: 400 }
      );
    }

    // Validate amount (in millisatoshis)
    const amountValidation = validateAmount(amount);
    if (!amountValidation.valid) {
      return NextResponse.json(
        { status: 'ERROR', reason: amountValidation.error },
        { status: 400 }
      );
    }

    const amountSats = amountValidation.amountSats!;

    // Sanitize comment
    const sanitizedComment = sanitizeComment(comment);
    if (comment && comment.length > 500) {
      return NextResponse.json(
        { status: 'ERROR', reason: 'Comment too long (max 500 characters)' },
        { status: 400 }
      );
    }

    // Look up user
    const user = await getUserByUsername(username.toLowerCase());

    if (!user || !user.spark_public_key) {
      return NextResponse.json(
        { status: 'ERROR', reason: `User @${username} not found or not available for payments` },
        { status: 404 }
      );
    }

    // Create memo
    const memo = sanitizedComment
      ? `LNURL payment for @${username}: ${sanitizedComment}`
      : `LNURL payment for @${username}`;

    // Create Lightning invoice via Spark SDK
    const encodedInvoice = await createInvoiceForUser(
      user.spark_public_key,
      amountSats,
      memo
    );

    // Return LUD-06 compliant response
    return NextResponse.json({
      pr: encodedInvoice,
      successAction: null,
      disposable: true,
      routes: [],
    });
  } catch (error) {
    console.error('Error in LNURL-pay payreq:', error);
    return NextResponse.json(
      { status: 'ERROR', reason: 'Unable to create invoice at this time' },
      { status: 500 }
    );
  }
}
