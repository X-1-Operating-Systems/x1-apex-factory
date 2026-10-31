import { base44 } from '@/api/base44Client';

export async function loadBridgeState() {
  const { data } = await base44.functions.invoke('x1Bridge', { action: 'state' });
  return data;
}

export async function runBridgeRoundTrip() {
  const { data } = await base44.functions.invoke('x1Bridge', { action: 'verify' });
  return data;
}

export async function loadBridgeEvents(limit = 12) {
  const page = await base44.entities.BridgeEvent.filter({}, { sort: '-at', limit });
  return page.items;
}