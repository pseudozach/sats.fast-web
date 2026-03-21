import { SparkWallet } from '@buildonspark/spark-sdk';
import { getConfigValue, setConfigValue } from '@/lib/supabase';

let sparkWallet: InstanceType<typeof SparkWallet> | null = null;
let walletInitPromise: Promise<InstanceType<typeof SparkWallet>> | null = null;

export async function getSparkWallet(): Promise<InstanceType<typeof SparkWallet>> {
  // Return cached wallet if available
  if (sparkWallet) return sparkWallet;

  // If initialization is already in progress, wait for it
  if (walletInitPromise) return walletInitPromise;

  // Start initialization
  walletInitPromise = initializeWallet();

  try {
    sparkWallet = await walletInitPromise;
    return sparkWallet;
  } catch (error) {
    // Reset promise so next call retries
    walletInitPromise = null;
    throw error;
  }
}

type SparkNetwork = 'MAINNET' | 'TESTNET' | 'SIGNET' | 'REGTEST' | 'LOCAL';

async function getMnemonic(): Promise<string> {
  // 1. Check env var first (manual override)
  if (process.env.SPARK_MNEMONIC) {
    return process.env.SPARK_MNEMONIC;
  }

  // 2. Check Supabase config table for previously generated mnemonic
  const stored = await getConfigValue('spark_mnemonic');
  if (stored) {
    console.log('Using stored Spark gateway mnemonic from config');
    return stored;
  }

  // 3. Auto-generate: initialize without mnemonic to get one, then store it
  console.log('No Spark mnemonic found — generating a new gateway wallet...');
  const network = (process.env.SPARK_NETWORK || 'MAINNET') as SparkNetwork;
  const { wallet, mnemonic } = await SparkWallet.initialize({
    accountNumber: 1,
    options: { network },
  });

  // Store the generated mnemonic for future cold starts
  if (mnemonic) {
    await setConfigValue('spark_mnemonic', mnemonic);
    console.log('Generated and stored new Spark gateway mnemonic');
  }

  // Cache this wallet directly since we already have it
  sparkWallet = wallet;

  if (!mnemonic) {
    throw new Error('SparkWallet.initialize did not return a mnemonic');
  }
  return mnemonic;
}

async function initializeWallet(): Promise<InstanceType<typeof SparkWallet>> {
  const mnemonic = await getMnemonic();
  const network = (process.env.SPARK_NETWORK || 'MAINNET') as SparkNetwork;

  // If wallet was already set during mnemonic generation, return it
  if (sparkWallet) return sparkWallet;

  const walletConfig: Record<string, unknown> = {
    accountNumber: 1,
    mnemonicOrSeed: mnemonic,
    options: {
      network,
    },
  };

  const result = await SparkWallet.initialize(walletConfig);
  console.log('Spark wallet initialized successfully');
  return result.wallet;
}

export async function createInvoiceForUser(
  receiverIdentityPubkey: string,
  amountSats: number,
  memo: string
): Promise<string> {
  const wallet = await getSparkWallet();

  const invoice = await wallet.createLightningInvoice({
    amountSats,
    memo,
    receiverIdentityPubkey,
  });

  if (!invoice?.invoice?.encodedInvoice) {
    throw new Error('Failed to create Lightning invoice');
  }

  return invoice.invoice.encodedInvoice;
}
