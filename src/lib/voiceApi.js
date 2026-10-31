import { callVideo } from '@/lib/videoApi';

// Every call lands on the app's own container. One function, one shape: { ok, data, error }.
export async function voiceCall(action, input = {}) {
  return callVideo('voice', action, input);
}

export function voiceData(result) {
  const payload = result?.data;
  return payload?.data ?? payload ?? null;
}

/** Carry a private render back as a blob URL the browser can play without the host token. */
export async function loadAudio(path) {
  const result = await voiceCall('audio', { path });
  const payload = voiceData(result);
  if (!result?.ok || !payload?.audio_base64) {
    return { ok: false, error: result?.error || payload?.error || 'The audio could not be loaded.' };
  }
  const binary = atob(payload.audio_base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return {
    ok: true,
    url: URL.createObjectURL(new Blob([bytes], { type: payload.mime || 'audio/wav' })),
    mime: payload.mime || 'audio/wav',
    bytes: payload.bytes || bytes.length,
  };
}

export async function fileToBase64(file) {
  const buffer = await file.arrayBuffer();
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const step = 0x8000;
  for (let i = 0; i < bytes.length; i += step) {
    binary += String.fromCharCode(...bytes.subarray(i, i + step));
  }
  return btoa(binary);
}

export function formatBytes(value) {
  const size = Number(value) || 0;
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(0)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}