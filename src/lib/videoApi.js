import { base44 } from '@/api/base44Client';

// One call path for both providers. The function answers { ok, data, verified, record } or an
// error with the provider's own message; a 4xx arrives as a thrown response, so both shapes
// are normalised to the same object the screens read.
export async function callVideo(provider, action, input = {}, confirm = false) {
  try {
    const res = await base44.functions.invoke('video', { provider, action, input, confirm });
    return res.data || { ok: false, error: 'The video service returned nothing.' };
  } catch (error) {
    const detail = error?.response?.data;
    if (detail && typeof detail === 'object') return detail;
    return { ok: false, error: error?.message || 'The request failed.' };
  }
}

// The provider's own payload, whatever wrapping it used.
export function payloadOf(result) {
  const data = result?.data;
  if (!data) return null;
  return data.data ?? data;
}

// The list inside a payload, whatever wrapping the provider used ({ data: [...] } or a bare array).
export function listOf(result) {
  const payload = payloadOf(result);
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
}

export const SANDBOX_AVATAR_ID = 'dd73ea75-1218-4ef3-92ce-606d5f7fbc0a';

export const RATIOS = ['16:9', '9:16', '1:1', 'auto'];