'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  const [copied, setCopied] = useState(false);

  const installCommand =
    'curl -sSL https://raw.githubusercontent.com/pseudozach/sats.fast/main/scripts/install.sh | bash';

  async function copyToClipboard() {
    try {
      await navigator.clipboard.writeText(installCommand);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = installCommand;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <main className="min-h-screen flex flex-col">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-md bg-[#050505]/80 border-b border-[#1a1a1a]">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/favicon.png" alt="sats.fast" width={28} height={30} className="h-7 w-auto" />
            <span className="text-white font-semibold text-lg">sats.fast</span>
          </Link>
          <div className="flex items-center gap-5">
            <a
              href="https://github.com/pseudozach/sats.fast"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-80 transition-opacity"
            >
              <img
                src="https://img.shields.io/github/stars/pseudozach/sats.fast?style=social"
                alt="GitHub stars"
                height={20}
              />
            </a>
            <Link
              href="/claim"
              className="text-sm bg-bitcoin hover:bg-bitcoin-dark text-black font-medium px-4 py-1.5 rounded-full transition-colors"
            >
              Claim Username
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 pt-32 pb-20">
        <div className="max-w-2xl w-full text-center">
          {/* Headline */}
          <h1 className="animate-fade-up text-4xl sm:text-5xl font-bold tracking-tight leading-tight mb-4">
            Talk to your money.
          </h1>

          <p className="animate-fade-up-delay text-lg text-[#888] max-w-lg mx-auto leading-relaxed mb-12">
            Your personal Bitcoin financial agent. Self-custodial. One command to install.
            Send bitcoin or USDT to anyone just by saying it.
          </p>

          {/* Step 1: Install */}
          <div className="animate-fade-up-delay-2 mb-16">
            <div className="flex items-center gap-2 mb-4">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-bitcoin/10 text-bitcoin text-xs font-bold">
                1
              </span>
              <span className="text-sm text-[#888]">Install your Bitcoin agent</span>
            </div>

            <div className="code-block text-left relative group">
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#1a1a1a]">
                <span className="text-xs text-[#555]">terminal</span>
                <button
                  onClick={copyToClipboard}
                  className="copy-btn text-[#555] text-xs flex items-center gap-1"
                >
                  {copied ? (
                    <>
                      <i className="fa-solid fa-check text-green-400" />
                      copied
                    </>
                  ) : (
                    <>
                      <i className="fa-regular fa-copy" />
                      copy
                    </>
                  )}
                </button>
              </div>
              <pre>
                <code className="text-green-400 font-mono text-sm break-all whitespace-pre-wrap">
                  {installCommand}
                </code>
              </pre>
            </div>
          </div>

          {/* Step 2: Claim */}
          <div className="animate-fade-up-delay-2">
            <div className="flex items-center gap-2 mb-4">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-bitcoin/10 text-bitcoin text-xs font-bold">
                2
              </span>
              <span className="text-sm text-[#888]">Claim your lightning address</span>
            </div>

            <div className="gradient-border rounded-2xl bg-[#0d0d0d] p-8">
              <p className="text-[#ccc] text-sm leading-relaxed mb-6">
                Once your agent is set up, claim your username so your friends can send you money.
                Tell your wallet{' '}
                <span className="text-white font-medium">&ldquo;send $5 to z@sats.fast&rdquo;</span>{' '}
                or{' '}
                <span className="text-white font-medium">&ldquo;send ₿5000 to skye@sats.fast&rdquo;</span>.
                <br />
                <br />
                That&apos;s it — you don&apos;t need to know anything about anything.
              </p>

              <a
                href="/claim"
                className="btn-primary relative z-10 inline-flex items-center gap-2 text-black font-semibold px-6 py-3 rounded-full text-sm cursor-pointer"
              >
                Claim your username
                <i className="fa-solid fa-arrow-right text-xs" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-[#1a1a1a] py-20 px-6">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-12 text-center">How it works</h2>

          <div className="grid gap-8">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-bitcoin/10 flex items-center justify-center">
                <span className="text-bitcoin text-lg">⚡</span>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Spark for Bitcoin</h3>
                <p className="text-sm text-[#888] leading-relaxed">
                  Your bitcoin lives in a Spark wallet on the Bitcoin network. Self-custodial — only you control your keys.
                  Anyone can send you sats via your lightning address.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-bitcoin/10 flex items-center justify-center">
                <span className="text-bitcoin text-lg">💵</span>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Liquid for USDT</h3>
                <p className="text-sm text-[#888] leading-relaxed">
                  Optionally link your Liquid address to receive USDT. Other sats.fast users can send you dollars
                  just by telling their agent.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-bitcoin/10 flex items-center justify-center">
                <span className="text-bitcoin text-lg">🤖</span>
              </div>
              <div>
                <h3 className="font-semibold mb-1">AI-powered agent</h3>
                <p className="text-sm text-[#888] leading-relaxed">
                  Built with LangChain for reasoning, Tether WDK for Bitcoin wallet execution,
                  and Breez SDK for Liquid and swaps. Just talk to it.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#1a1a1a] py-8 px-6">
        <div className="max-w-2xl mx-auto flex items-center justify-between text-xs text-[#555]">
          <span>sats.fast</span>
          <div className="flex items-center gap-5">
            <a
              href="https://github.com/pseudozach/sats.fast"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-[#888] transition-colors"
            >
              <i className="fa-brands fa-github text-sm" />
              Source
            </a>
            <a
              href="mailto:hi@sats.fast"
              className="flex items-center gap-1.5 hover:text-[#888] transition-colors"
            >
              <i className="fa-solid fa-envelope text-sm" />
              hi@sats.fast
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
