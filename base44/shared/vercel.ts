const HOST = 'https://api.vercel.com';

export function deploymentName(projectName: string, hash: string): string {
  const slug = String(projectName || 'site')
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
  const stamp = String(hash || '')
    .replace(/[^a-z0-9]/gi, '')
    .slice(0, 6)
    .toLowerCase();
  return `${slug || 'site'}-${stamp || 'build'}`;
}

async function readDeployment(token: string, id: string) {
  const response = await fetch(`${HOST}/v13/deployments/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json: any = await response.json().catch(() => ({}));
  return {
    state: String(json?.readyState || '').toUpperCase(),
    error: json?.errorMessage || null,
  };
}

export async function deployToVercel({
  token,
  name,
  files,
}: {
  token: string;
  name: string;
  files: { name: string; content: string }[];
}): Promise<{ url?: string | null; id?: string | null; state?: string; error?: string }> {
  if (!token) return { error: 'VERCEL_API_KEY is not set, so no release can be pushed.' };
  if (!files.length) return { error: 'The bundle holds no files to deploy.' };

  const payload = {
    name,
    target: 'production',
    projectSettings: { framework: null },
    files: files.map((file) => ({ file: file.name, data: file.content, encoding: 'utf-8' })),
  };

  let response: Response;
  try {
    response = await fetch(`${HOST}/v13/deployments?forceNew=1&skipAutoDetectionConfirmation=1`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (error: any) {
    return { error: `Vercel could not be reached: ${error?.message || 'network error'}` };
  }

  const json: any = await response.json().catch(() => ({}));
  if (!response.ok) {
    return { error: json?.error?.message || `Vercel answered ${response.status}` };
  }

  const id = json?.id || null;
  const url = json?.url ? `https://${json.url}` : null;

  // Vercel accepts the upload before it has built it, so wait for the verdict instead of assuming success
  let state = String(json?.readyState || 'QUEUED').toUpperCase();
  let error: string | null = null;
  for (let attempt = 0; id && attempt < 6; attempt += 1) {
    if (state === 'READY' || state === 'ERROR' || state === 'CANCELED') break;
    await new Promise((resolve) => setTimeout(resolve, 2500));
    const read = await readDeployment(token, id);
    state = read.state || state;
    error = read.error;
  }

  return { id, url, state, error: error || undefined };
}