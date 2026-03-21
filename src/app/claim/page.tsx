'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

type FormState = 'idle' | 'loading' | 'success' | 'error';

export default function ClaimPage() {
  const [username, setUsername] = useState('');
  const [sparkPublicKey, setSparkPublicKey] = useState('');
  const [liquidAddress, setLiquidAddress] = useState('');
  const [formState, setFormState] = useState<FormState>('idle');
  const [message, setMessage] = useState('');
  const [lightningAddress, setLightningAddress] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormState('loading');
    setMessage('');

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim().toLowerCase(),
          sparkPublicKey: sparkPublicKey.trim(),
          liquidAddress: liquidAddress.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setFormState('success');
        setLightningAddress(data.lightningAddress);
        setMessage(data.message);
      } else {
        setFormState('error');
        setMessage(data.error || 'Something went wrong');
      }
    } catch {
      setFormState('error');
      setMessage('Network error. Please try again.');
    }
  }

  const domain = 'sats.fast';

  return (
    <main className="min-h-screen flex flex-col">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-md bg-[#050505]/80 border-b border-[#1a1a1a]">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/favicon.png" alt="sats.fast" width={28} height={30} className="h-7 w-auto" />
            <span className="text-white font-semibold text-lg">sats.fast</span>
          </Link>
          <Link href="/" className="text-[#888] hover:text-white text-sm transition-colors">
            ← Back
          </Link>
        </div>
      </nav>

      {/* Content */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 pt-28 pb-20">
        <div className="max-w-md w-full">
          {formState === 'success' ? (
            /* Success state */
            <div className="text-center animate-fade-up">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-500/10 flex items-center justify-center">
                <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold mb-2">You&apos;re all set!</h1>
              <p className="text-[#888] text-sm mb-6">{message}</p>

              <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl p-6 mb-6">
                <p className="text-xs text-[#555] mb-2">Your lightning address</p>
                <p className="text-lg font-mono text-bitcoin font-semibold">{lightningAddress}</p>
              </div>

              <p className="text-xs text-[#555] leading-relaxed">
                Anyone can now send you bitcoin by paying to{' '}
                <span className="text-[#888]">{lightningAddress}</span> from any Lightning wallet.
              </p>

              <Link
                href="/"
                className="inline-block mt-8 text-sm text-[#888] hover:text-white transition-colors"
              >
                ← Back to home
              </Link>
            </div>
          ) : (
            /* Form state */
            <>
              <div className="text-center mb-10 animate-fade-up">
                <h1 className="text-3xl font-bold mb-3">Claim your username</h1>
                <p className="text-[#888] text-sm leading-relaxed">
                  Register a lightning address so anyone can send you money.
                  <br />
                  First{' '}
                  <Link href="/" className="text-bitcoin hover:underline">
                    install your agent
                  </Link>
                  , then come back here.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5 animate-fade-up-delay">
                {/* Username */}
                <div>
                  <label className="block text-xs text-[#888] mb-2 font-medium">
                    Username
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_-]/g, ''))}
                      placeholder="satoshi"
                      required
                      maxLength={50}
                      className="w-full bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl px-4 py-3 text-sm outline-none placeholder:text-[#333]"
                    />
                    {username && (
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-[#555]">
                        @{domain}
                      </span>
                    )}
                  </div>
                  {username && (
                    <p className="text-xs text-[#555] mt-1.5">
                      Your address: <span className="text-[#888]">{username.toLowerCase()}@{domain}</span>
                    </p>
                  )}
                </div>

                {/* Spark Public Key */}
                <div>
                  <label className="block text-xs text-[#888] mb-2 font-medium">
                    Spark Public Key <span className="text-[#555]">(required)</span>
                  </label>
                  <input
                    type="text"
                    value={sparkPublicKey}
                    onChange={(e) => setSparkPublicKey(e.target.value)}
                    placeholder="Your hex-encoded Spark identity public key"
                    required
                    className="w-full bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl px-4 py-3 text-sm font-mono outline-none placeholder:text-[#333]"
                  />
                  <p className="text-xs text-[#555] mt-1.5">
                    Find this in your sats.fast agent — ask it &ldquo;what&apos;s my spark public key?&rdquo;
                  </p>
                </div>

                {/* Liquid Address */}
                <div>
                  <label className="block text-xs text-[#888] mb-2 font-medium">
                    Liquid USDT Address <span className="text-[#555]">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={liquidAddress}
                    onChange={(e) => setLiquidAddress(e.target.value)}
                    placeholder="Your Liquid address for receiving USDT"
                    className="w-full bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl px-4 py-3 text-sm font-mono outline-none placeholder:text-[#333]"
                  />
                  <p className="text-xs text-[#555] mt-1.5">
                    Other sats.fast users will be able to send you USDT via Liquid.
                  </p>
                </div>

                {/* Error message */}
                {formState === 'error' && message && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                    <p className="text-red-400 text-sm">{message}</p>
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={formState === 'loading' || !username || !sparkPublicKey}
                  className="btn-primary w-full text-black font-semibold py-3 rounded-xl text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {formState === 'loading' ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Registering...
                    </span>
                  ) : (
                    'Claim username'
                  )}
                </button>
              </form>

              <p className="text-center text-xs text-[#444] mt-8">
                One Spark key per username. One username per Spark key.
                <br />
                Free forever.
              </p>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
