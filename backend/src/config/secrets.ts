import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

const client = new SecretManagerServiceClient();
const PROJECT_ID = 'futurelink-private-112912460';

interface Secrets {
  JWT_SECRET: string;
  DATABASE_URL: string;
  GEMINI_API_KEY: string;
}

/**
 * Load secrets from Google Secret Manager
 * Falls back to environment variables for local development
 */
export async function loadSecrets(): Promise<Secrets> {
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  if (isDevelopment) {
    console.log('🔧 Development mode: Loading secrets from .env file');
    return {
      JWT_SECRET: process.env.JWT_SECRET || '',
      DATABASE_URL: process.env.DATABASE_URL || '',
      GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
    };
  }

  console.log('🔐 Production mode: Loading secrets from Google Secret Manager');

  try {
    const [jwtSecret, databaseUrl, geminiKey] = await Promise.all([
      accessSecret('jobmatch-jwt-secret'),
      accessSecret('jobmatch-database-url'),
      accessSecret('jobmatch-gemini-key'),
    ]);

    return {
      JWT_SECRET: jwtSecret,
      DATABASE_URL: databaseUrl,
      GEMINI_API_KEY: geminiKey,
    };
  } catch (error) {
    console.error('❌ Failed to load secrets from Secret Manager:', error);
    throw new Error('Failed to load secrets. Ensure Secret Manager is configured.');
  }
}

/**
 * Access a specific secret from Google Secret Manager
 */
async function accessSecret(secretName: string): Promise<string> {
  const name = `projects/${PROJECT_ID}/secrets/${secretName}/versions/latest`;

  try {
    const [version] = await client.accessSecretVersion({ name });
    const payload = version.payload?.data?.toString();

    if (!payload) {
      throw new Error(`Secret ${secretName} is empty`);
    }

    return payload;
  } catch (error) {
    console.error(`Failed to access secret ${secretName}:`, error);
    throw error;
  }
}

/**
 * Validate that all required secrets are present
 */
export function validateSecrets(secrets: Secrets): void {
  const missing: string[] = [];

  if (!secrets.JWT_SECRET) missing.push('JWT_SECRET');
  if (!secrets.DATABASE_URL) missing.push('DATABASE_URL');
  if (!secrets.GEMINI_API_KEY) missing.push('GEMINI_API_KEY');

  if (missing.length > 0) {
    throw new Error(
      `Missing required secrets: ${missing.join(', ')}. ` +
      'Ensure secrets are configured in Google Secret Manager or .env file.'
    );
  }
}

// Cache loaded secrets
let cachedSecrets: Secrets | null = null;

/**
 * Get secrets (cached after first load)
 */
export async function getSecrets(): Promise<Secrets> {
  if (cachedSecrets) {
    return cachedSecrets;
  }

  cachedSecrets = await loadSecrets();
  validateSecrets(cachedSecrets);

  return cachedSecrets;
}
