import moment from 'moment';

export const FALLBACK_TZ = 'America/New_York';
const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const SHORT_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const FALLBACK_ZONES = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Anchorage',
  'Pacific/Honolulu',
  'America/Toronto',
  'America/Mexico_City',
  'America/Sao_Paulo',
  'Europe/London',
  'Europe/Dublin',
  'Europe/Paris',
  'Europe/Berlin',
  'Europe/Madrid',
  'Europe/Rome',
  'Europe/Amsterdam',
  'Europe/Stockholm',
  'Europe/Warsaw',
  'Europe/Athens',
  'Europe/Istanbul',
  'Africa/Lagos',
  'Africa/Cairo',
  'Africa/Johannesburg',
  'Asia/Dubai',
  'Asia/Karachi',
  'Asia/Kolkata',
  'Asia/Singapore',
  'Asia/Hong_Kong',
  'Asia/Shanghai',
  'Asia/Tokyo',
  'Asia/Seoul',
  'Australia/Perth',
  'Australia/Sydney',
  'Pacific/Auckland',
  'UTC',
];

export const TIMEZONES = (() => {
  try {
    const list = Intl.supportedValuesOf('timeZone');
    if (Array.isArray(list) && list.length > 0) return list;
  } catch (err) {
    // Older engines: fall through to the short list.
  }
  return FALLBACK_ZONES;
})();

export function detectTimezone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || FALLBACK_TZ;
  } catch (err) {
    return FALLBACK_TZ;
  }
}

export function zoneOf(automation) {
  return automation?.timezone || FALLBACK_TZ;
}

function zonedParts(date, timeZone) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    weekday: 'short',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);
  const map = {};
  for (const part of parts) map[part.type] = part.value;
  return {
    year: Number(map.year),
    month: Number(map.month),
    day: Number(map.day),
    hour: Number(map.hour) % 24,
    weekday: SHORT_DAYS.indexOf(map.weekday),
  };
}

function wallClockToInstant(year, month, day, hour, timeZone) {
  let guess = Date.UTC(year, month - 1, day, hour, 0, 0);
  for (let i = 0; i < 3; i += 1) {
    const reading = zonedParts(new Date(guess), timeZone);
    const drift =
      Date.UTC(reading.year, reading.month - 1, reading.day, reading.hour, 0, 0) - guess;
    if (Math.abs(drift) < 60000) break;
    guess -= drift;
  }
  return new Date(guess);
}

export function nextRun(automation, from = new Date()) {
  const timeZone = zoneOf(automation);
  const cadence = automation?.cadence || 'daily';
  const hour = Number(automation?.run_hour ?? 9);
  const now = zonedParts(from, timeZone);

  if (cadence === 'hourly') {
    const topOfHour = wallClockToInstant(now.year, now.month, now.day, now.hour, timeZone);
    let next = new Date(topOfHour.getTime() + 3600000);
    while (next <= from) next = new Date(next.getTime() + 3600000);
    return next;
  }

  for (let offset = 0; offset <= 8; offset += 1) {
    const day = new Date(Date.UTC(now.year, now.month - 1, now.day + offset));
    const weekday = day.getUTCDay();
    if (cadence === 'weekly' && weekday !== Number(automation?.run_day ?? 1)) continue;
    const candidate = wallClockToInstant(
      day.getUTCFullYear(),
      day.getUTCMonth() + 1,
      day.getUTCDate(),
      hour,
      timeZone
    );
    if (candidate > from) return candidate;
  }
  return null;
}

export function shortZone(timeZone) {
  try {
    const parts = new Intl.DateTimeFormat('en-US', { timeZone, timeZoneName: 'short' }).formatToParts(
      new Date()
    );
    return parts.find((part) => part.type === 'timeZoneName')?.value || timeZone;
  } catch (err) {
    return timeZone || FALLBACK_TZ;
  }
}

export function isEventAutomation(automation) {
  return automation?.trigger_mode === 'event';
}

export function eventLabel(automation) {
  const when = automation?.event_when || 'any';
  if (when === 'done') return 'After a task succeeds';
  if (when === 'failed') return 'After a task fails';
  return 'After any task finishes';
}

export function scheduleLabel(automation) {
  if (isEventAutomation(automation)) return eventLabel(automation);
  const cadence = automation?.cadence || 'daily';
  const zone = shortZone(zoneOf(automation));
  const hour = `${String(automation?.run_hour ?? 9).padStart(2, '0')}:00`;
  if (cadence === 'hourly') return `Every hour · ${zone}`;
  if (cadence === 'weekly') {
    return `${WEEKDAYS[Number(automation?.run_day ?? 1)]} ${hour} · ${zone}`;
  }
  return `Daily ${hour} · ${zone}`;
}

export function nextRunLabel(automation) {
  if (!automation) return '';
  if (automation.enabled === false) return 'Paused';
  if (isEventAutomation(automation)) return 'Waiting for a task to finish';
  const next = nextRun(automation);
  if (!next) return 'Scheduled';
  const stamp = new Intl.DateTimeFormat(undefined, {
    timeZone: zoneOf(automation),
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(next);
  return `${moment(next).fromNow()} · ${stamp}`;
}

export function formatRunTime(value) {
  if (!value) return '';
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
}