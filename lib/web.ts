const DEFAULT_WEB_ORIGIN = 'https://notas-nu-lemon.vercel.app';

function normalizeOrigin(value?: string | null): string | null {
  if (!value) {
    return null;
  }

  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

function isLocalOrigin(origin: string): boolean {
  const hostname = new URL(origin).hostname;

  return (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '0.0.0.0' ||
    hostname.endsWith('.local')
  );
}

export function getConfiguredWebOrigin(): string {
  return normalizeOrigin(process.env.EXPO_PUBLIC_WEB_APP_URL) ?? DEFAULT_WEB_ORIGIN;
}

export function getWebApiUrl(path: string): string {
  return `${getConfiguredWebOrigin()}${path}`;
}

export function getWebOriginCandidates(scannedUrl?: string): string[] {
  const configuredOrigin = getConfiguredWebOrigin();
  const scannedOrigin = normalizeOrigin(scannedUrl);
  const candidates: string[] = [];

  if (scannedOrigin && !isLocalOrigin(scannedOrigin)) {
    candidates.push(scannedOrigin);
  }

  if (!candidates.includes(configuredOrigin)) {
    candidates.push(configuredOrigin);
  }

  return candidates;
}

type PostJsonOptions = {
  scannedUrl?: string;
  headers?: Record<string, string>;
};

export async function postJsonToWeb(
  path: string,
  body: unknown,
  options: PostJsonOptions = {}
): Promise<{ response: Response; origin: string }> {
  const origins = getWebOriginCandidates(options.scannedUrl);
  let lastResponse: Response | null = null;
  let lastError: unknown = null;

  for (const origin of origins) {
    try {
      const response = await fetch(`${origin}${path}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        return { response, origin };
      }

      lastResponse = response;
    } catch (error) {
      lastError = error;
    }
  }

  if (lastResponse) {
    return { response: lastResponse, origin: origins[origins.length - 1] };
  }

  throw lastError ?? new Error('No se pudo contactar la web');
}
