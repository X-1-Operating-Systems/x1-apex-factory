/**
 * The connector allowlist. A run may only ever call an action that appears here:
 * host, method and path shape are fixed in code, and the model supplies parameters
 * that are validated and encoded before they touch a URL.
 *
 * `write: true` actions additionally require the operator to have granted
 * read/write access AND switched the connector to auto-approve.
 */

const TIMEOUT_MS = 15000;
const MAX_BODY = 3500;

export type ToolParam = { name: string; note: string; required?: boolean };

export type Tool = {
  id: string;
  label: string;
  write: boolean;
  params: ToolParam[];
  request: (params: any) => { url: string; method: string; body?: any; headers?: any };
};

export type ConnectorSpec = { label: string; tools: Tool[] };

const seg = (value: any) => encodeURIComponent(String(value || '').trim());

const num = (value: any, fallback: number, max: number) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return Math.min(Math.floor(parsed), max);
};

const json = (body: any) => ({ 'Content-Type': 'application/json' });

const B64URL = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

/** base64url without padding, for Gmail's `raw` field. */
function b64url(text: string) {
  const bytes = new TextEncoder().encode(text);
  let out = '';
  for (let i = 0; i < bytes.length; i += 3) {
    const a = bytes[i];
    const b = bytes[i + 1];
    const c = bytes[i + 2];
    out += B64URL[a >> 2];
    out += B64URL[((a & 3) << 4) | ((b ?? 0) >> 4)];
    if (b === undefined) break;
    out += B64URL[((b & 15) << 2) | ((c ?? 0) >> 6)];
    if (c === undefined) break;
    out += B64URL[c & 63];
  }
  return out;
}

/** Returns the live token for a connector key, or '' when nothing is connected. */
async function resolveAccessToken(base44: any, key: string): Promise<string> {
  try {
    const connection = await base44.asServiceRole.connectors.getConnection(key);
    return connection?.accessToken || '';
  } catch {
    return '';
  }
}

export const CONNECTOR_SPECS: Record<string, ConnectorSpec> = {
  gmail: {
    label: 'Gmail',
    tools: [
      {
        id: 'search_messages',
        label: 'Search mail',
        write: false,
        params: [
          { name: 'query', note: 'Gmail search syntax, e.g. from:anna newer_than:7d', required: true },
          { name: 'limit', note: '1-20, default 8' },
        ],
        request: (p) => ({
          url: `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=${num(p.limit, 8, 20)}&q=${encodeURIComponent(String(p.query || ''))}`,
          method: 'GET',
        }),
      },
      {
        id: 'read_message',
        label: 'Read one message',
        write: false,
        params: [
          { name: 'message_id', note: 'the id returned by search_messages', required: true },
        ],
        request: (p) => ({
          url: `https://gmail.googleapis.com/gmail/v1/users/me/messages/${seg(p.message_id)}?format=metadata&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=Date`,
          method: 'GET',
        }),
      },
    ],
  },
  googlecalendar: {
    label: 'Google Calendar',
    tools: [
      {
        id: 'list_events',
        label: 'List events',
        write: false,
        params: [
          { name: 'time_min', note: 'ISO date-time to start from, e.g. 2026-11-01T00:00:00Z', required: true },
          { name: 'time_max', note: 'ISO date-time to end at' },
          { name: 'limit', note: '1-20, default 10' },
        ],
        request: (p) => {
          const query = [
            'singleEvents=true',
            'orderBy=startTime',
            `maxResults=${num(p.limit, 10, 20)}`,
            `timeMin=${encodeURIComponent(String(p.time_min || ''))}`,
            p.time_max ? `timeMax=${encodeURIComponent(String(p.time_max))}` : '',
          ].filter(Boolean).join('&');
          return { url: `https://www.googleapis.com/calendar/v3/calendars/primary/events?${query}`, method: 'GET' };
        },
      },
      {
        id: 'create_event',
        label: 'Create an event',
        write: true,
        params: [
          { name: 'summary', note: 'event title', required: true },
          { name: 'start', note: 'ISO date-time', required: true },
          { name: 'end', note: 'ISO date-time', required: true },
          { name: 'description', note: 'agenda or notes' },
        ],
        request: (p) => ({
          url: 'https://www.googleapis.com/calendar/v3/calendars/primary/events',
          method: 'POST',
          headers: json(null),
          body: {
            summary: String(p.summary || '').slice(0, 200),
            description: String(p.description || '').slice(0, 4000),
            start: { dateTime: String(p.start || '') },
            end: { dateTime: String(p.end || '') },
          },
        }),
      },
    ],
  },
  googledrive: {
    label: 'Google Drive',
    tools: [
      {
        id: 'search_files',
        label: 'Search files',
        write: false,
        params: [
          { name: 'query', note: "Drive query, e.g. name contains 'proposal'", required: true },
          { name: 'limit', note: '1-20, default 10' },
        ],
        request: (p) => ({
          url: `https://www.googleapis.com/drive/v3/files?pageSize=${num(p.limit, 10, 20)}&fields=${encodeURIComponent('files(id,name,mimeType,modifiedTime,webViewLink)')}&q=${encodeURIComponent(String(p.query || ''))}`,
          method: 'GET',
        }),
      },
    ],
  },
  googlesheets: {
    label: 'Google Sheets',
    tools: [
      {
        id: 'read_range',
        label: 'Read a range',
        write: false,
        params: [
          { name: 'spreadsheet_id', note: 'the id from the sheet URL', required: true },
          { name: 'range', note: 'A1 notation, e.g. Leads!A1:F20', required: true },
        ],
        request: (p) => ({
          url: `https://sheets.googleapis.com/v4/spreadsheets/${seg(p.spreadsheet_id)}/values/${seg(p.range)}`,
          method: 'GET',
        }),
      },
      {
        id: 'append_row',
        label: 'Append a row',
        write: true,
        params: [
          { name: 'spreadsheet_id', note: 'the id from the sheet URL', required: true },
          { name: 'range', note: 'A1 notation of the table, e.g. Leads!A1', required: true },
          { name: 'values', note: 'array of cell values, in column order', required: true },
        ],
        request: (p) => ({
          url: `https://sheets.googleapis.com/v4/spreadsheets/${seg(p.spreadsheet_id)}/values/${seg(p.range)}:append?valueInputOption=USER_ENTERED`,
          method: 'POST',
          headers: json(null),
          body: { values: [Array.isArray(p.values) ? p.values.slice(0, 30).map((v: any) => String(v).slice(0, 500)) : []] },
        }),
      },
    ],
  },
  github: {
    label: 'GitHub',
    tools: [
      {
        id: 'list_repos',
        label: 'List repositories',
        write: false,
        params: [{ name: 'limit', note: '1-20, default 10' }],
        request: (p) => ({
          url: `https://api.github.com/user/repos?per_page=${num(p.limit, 10, 20)}&sort=updated`,
          method: 'GET',
          headers: { Accept: 'application/vnd.github+json' },
        }),
      },
      {
        id: 'list_issues',
        label: 'List open issues',
        write: false,
        params: [
          { name: 'owner', note: 'repository owner', required: true },
          { name: 'repo', note: 'repository name', required: true },
          { name: 'limit', note: '1-20, default 10' },
        ],
        request: (p) => ({
          url: `https://api.github.com/repos/${seg(p.owner)}/${seg(p.repo)}/issues?state=open&per_page=${num(p.limit, 10, 20)}`,
          method: 'GET',
          headers: { Accept: 'application/vnd.github+json' },
        }),
      },
      {
        id: 'list_pull_requests',
        label: 'List open pull requests',
        write: false,
        params: [
          { name: 'owner', note: 'repository owner', required: true },
          { name: 'repo', note: 'repository name', required: true },
          { name: 'limit', note: '1-20, default 10' },
        ],
        request: (p) => ({
          url: `https://api.github.com/repos/${seg(p.owner)}/${seg(p.repo)}/pulls?state=open&per_page=${num(p.limit, 10, 20)}`,
          method: 'GET',
          headers: { Accept: 'application/vnd.github+json' },
        }),
      },
      {
        id: 'create_issue',
        label: 'Open an issue',
        write: true,
        params: [
          { name: 'owner', note: 'repository owner', required: true },
          { name: 'repo', note: 'repository name', required: true },
          { name: 'title', note: 'issue title', required: true },
          { name: 'body', note: 'issue description' },
        ],
        request: (p) => ({
          url: `https://api.github.com/repos/${seg(p.owner)}/${seg(p.repo)}/issues`,
          method: 'POST',
          headers: { Accept: 'application/vnd.github+json', ...json(null) },
          body: { title: String(p.title || '').slice(0, 200), body: String(p.body || '').slice(0, 4000) },
        }),
      },
    ],
  },
  hubspot: {
    label: 'HubSpot',
    tools: [
      {
        id: 'list_contacts',
        label: 'List recent contacts',
        write: false,
        params: [{ name: 'limit', note: '1-20, default 10' }],
        request: (p) => ({
          url: `https://api.hubapi.com/crm/v3/objects/contacts?limit=${num(p.limit, 10, 20)}&properties=email,firstname,lastname,lifecyclestage`,
          method: 'GET',
        }),
      },
    ],
  },
  slack: {
    label: 'Slack',
    tools: [
      {
        id: 'list_channels',
        label: 'List channels',
        write: false,
        params: [{ name: 'limit', note: '1-20, default 10' }],
        request: (p) => ({
          url: 'https://slack.com/api/conversations.list',
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: `limit=${num(p.limit, 10, 20)}&exclude_archived=true&types=public_channel,private_channel`,
        }),
      },
      {
        id: 'post_message',
        label: 'Post a message',
        write: true,
        params: [
          { name: 'channel', note: 'channel id from list_channels', required: true },
          { name: 'text', note: 'message body', required: true },
        ],
        request: (p) => ({
          url: 'https://slack.com/api/chat.postMessage',
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: `channel=${seg(p.channel)}&text=${encodeURIComponent(String(p.text || '').slice(0, 3000))}`,
        }),
      },
    ],
  },
  googleworkspace: {
    label: 'Google Workspace',
    tools: [
      {
        id: 'search_mail',
        label: 'Search Gmail',
        write: false,
        params: [
          { name: 'query', note: 'Gmail search syntax, e.g. from:anna newer_than:7d', required: true },
          { name: 'limit', note: '1-20, default 8' },
        ],
        request: (p) => ({
          url: `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=${num(p.limit, 8, 20)}&q=${encodeURIComponent(String(p.query || ''))}`,
          method: 'GET',
        }),
      },
      {
        id: 'read_mail',
        label: 'Read one Gmail message',
        write: false,
        params: [{ name: 'message_id', note: 'the id returned by search_mail', required: true }],
        request: (p) => ({
          url: `https://gmail.googleapis.com/gmail/v1/users/me/messages/${seg(p.message_id)}?format=metadata&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=Date`,
          method: 'GET',
        }),
      },
      {
        id: 'send_mail',
        label: 'Send mail',
        write: true,
        params: [
          { name: 'to', note: 'recipient address', required: true },
          { name: 'subject', note: 'subject line', required: true },
          { name: 'body', note: 'plain-text body', required: true },
        ],
        request: (p) => {
          const raw = `To: ${String(p.to || '')}\r\nSubject: ${String(p.subject || '').slice(0, 200)}\r\nMIME-Version: 1.0\r\nContent-Type: text/plain; charset="UTF-8"\r\n\r\n${String(p.body || '').slice(0, 8000)}`;
          return {
            url: 'https://gmail.googleapis.com/gmail/v1/users/me/messages/send',
            method: 'POST',
            headers: json(null),
            body: { raw: b64url(raw) },
          };
        },
      },
      {
        id: 'list_events',
        label: 'List calendar events',
        write: false,
        params: [
          { name: 'time_min', note: 'ISO date-time to start from, e.g. 2026-11-01T00:00:00Z', required: true },
          { name: 'time_max', note: 'ISO date-time to end at' },
          { name: 'limit', note: '1-20, default 10' },
        ],
        request: (p) => {
          const query = [
            'singleEvents=true',
            'orderBy=startTime',
            `maxResults=${num(p.limit, 10, 20)}`,
            `timeMin=${encodeURIComponent(String(p.time_min || ''))}`,
            p.time_max ? `timeMax=${encodeURIComponent(String(p.time_max))}` : '',
          ].filter(Boolean).join('&');
          return { url: `https://www.googleapis.com/calendar/v3/calendars/primary/events?${query}`, method: 'GET' };
        },
      },
      {
        id: 'create_event',
        label: 'Create a calendar event',
        write: true,
        params: [
          { name: 'summary', note: 'event title', required: true },
          { name: 'start', note: 'ISO date-time', required: true },
          { name: 'end', note: 'ISO date-time', required: true },
          { name: 'description', note: 'agenda or notes' },
        ],
        request: (p) => ({
          url: 'https://www.googleapis.com/calendar/v3/calendars/primary/events',
          method: 'POST',
          headers: json(null),
          body: {
            summary: String(p.summary || '').slice(0, 200),
            description: String(p.description || '').slice(0, 4000),
            start: { dateTime: String(p.start || '') },
            end: { dateTime: String(p.end || '') },
          },
        }),
      },
      {
        id: 'search_drive',
        label: 'Search Drive',
        write: false,
        params: [
          { name: 'query', note: "Drive query, e.g. name contains 'proposal'", required: true },
          { name: 'limit', note: '1-20, default 10' },
        ],
        request: (p) => ({
          url: `https://www.googleapis.com/drive/v3/files?pageSize=${num(p.limit, 10, 20)}&fields=${encodeURIComponent('files(id,name,mimeType,modifiedTime,webViewLink)')}&q=${encodeURIComponent(String(p.query || ''))}`,
          method: 'GET',
        }),
      },
      {
        id: 'read_drive_file',
        label: 'Read a Doc or file as text',
        write: false,
        params: [
          { name: 'file_id', note: 'the id returned by search_drive', required: true },
          { name: 'format', note: 'text, csv or html; default text' },
        ],
        request: (p) => {
          const choice = String(p.format || 'text').toLowerCase();
          const mime = choice === 'csv' ? 'text/csv' : choice === 'html' ? 'text/html' : 'text/plain';
          return {
            url: `https://www.googleapis.com/drive/v3/files/${seg(p.file_id)}/export?mimeType=${encodeURIComponent(mime)}`,
            method: 'GET',
          };
        },
      },
      {
        id: 'read_doc',
        label: 'Read a Google Doc structure',
        write: false,
        params: [{ name: 'document_id', note: 'the id from the Doc URL', required: true }],
        request: (p) => ({
          url: `https://docs.googleapis.com/v1/documents/${seg(p.document_id)}`,
          method: 'GET',
        }),
      },
      {
        id: 'read_sheet',
        label: 'Read a spreadsheet range',
        write: false,
        params: [
          { name: 'spreadsheet_id', note: 'the id from the Sheet URL', required: true },
          { name: 'range', note: 'A1 notation, e.g. Leads!A1:F20', required: true },
        ],
        request: (p) => ({
          url: `https://sheets.googleapis.com/v4/spreadsheets/${seg(p.spreadsheet_id)}/values/${seg(p.range)}`,
          method: 'GET',
        }),
      },
      {
        id: 'append_sheet_rows',
        label: 'Append rows to a sheet',
        write: true,
        params: [
          { name: 'spreadsheet_id', note: 'the id from the Sheet URL', required: true },
          { name: 'range', note: 'A1 notation of the table, e.g. Leads!A1', required: true },
          { name: 'values', note: 'array of rows, each an array of cell values', required: true },
        ],
        request: (p) => {
          const rows = Array.isArray(p.values) ? p.values.slice(0, 50) : [];
          return {
            url: `https://sheets.googleapis.com/v4/spreadsheets/${seg(p.spreadsheet_id)}/values/${seg(p.range)}:append?valueInputOption=USER_ENTERED`,
            method: 'POST',
            headers: json(null),
            body: {
              values: rows.map((row: any) =>
                Array.isArray(row) ? row.slice(0, 30).map((cell: any) => String(cell).slice(0, 500)) : [String(row).slice(0, 500)]
              ),
            },
          };
        },
      },
      {
        id: 'search_contacts',
        label: 'Search contacts',
        write: false,
        params: [
          { name: 'query', note: 'name or email fragment', required: true },
          { name: 'limit', note: '1-20, default 10' },
        ],
        request: (p) => ({
          url: `https://people.googleapis.com/v1/people:searchContacts?query=${encodeURIComponent(String(p.query || ''))}&readMask=names,emailAddresses,phoneNumbers&pageSize=${num(p.limit, 10, 20)}`,
          method: 'GET',
        }),
      },
    ],
  },
};

export function toolsFor(key: string): Tool[] {
  return CONNECTOR_SPECS[key]?.tools || [];
}

/** A compact, model-readable catalogue of what each installed connector can actually do. */
export function toolCatalogue(key: string): string {
  const spec = CONNECTOR_SPECS[key];
  if (!spec) return '';
  return spec.tools
    .map((tool) => {
      const params = tool.params.map((p) => `${p.name}${p.required ? '*' : ''}`).join(', ') || 'none';
      return `    ${tool.id} (${tool.write ? 'writes' : 'reads'}) — ${tool.label}; params: ${params}`;
    })
    .join('\n');
}

function compact(text: string) {
  return text.length > MAX_BODY ? `${text.slice(0, MAX_BODY)}… (truncated)` : text;
}

function summarize(text: string) {
  try {
    const parsed = JSON.parse(text);
    const list = parsed?.messages || parsed?.files || parsed?.items || parsed?.events || parsed?.results || parsed?.data || parsed?.contacts;
    if (Array.isArray(list)) {
      return compact(
        JSON.stringify({
          count: list.length,
          items: list.slice(0, 8).map((entry: any) => ({
            id: entry.id || entry.eventId || entry.message_id || entry.channel?.id || '',
            title: entry.name || entry.subject || entry.summary || entry.channel?.name || entry.properties?.email || '',
            detail: entry.snippet || entry.body || entry.text || entry.description || entry.mimeType || '',
            at: entry.date || entry.start?.dateTime || entry.start?.date || entry.modifiedTime || entry.updated || '',
          })),
        })
      );
    }
    return compact(JSON.stringify(parsed));
  } catch {
    return compact(text);
  }
}

export type ConnectorHit = { key: string; tool: string; status: 'ok' | 'error' | 'gated'; message: string };

export async function runConnectorTool(
  base44: any,
  { userId, key, tool: toolId, params, access = 'read', autoApprove = false, connected = false }: any
): Promise<ConnectorHit> {
  const cleanKey = String(key || '').trim();
  const cleanTool = String(toolId || '').trim();
  const spec = CONNECTOR_SPECS[cleanKey];
  const tool = spec?.tools.find((entry) => entry.id === cleanTool);

  if (!spec) {
    return {
      key: cleanKey,
      tool: cleanTool,
      status: 'error',
      message: `There is no runnable action for "${cleanKey}". Runnable connectors: ${Object.keys(CONNECTOR_SPECS).join(', ')}.`,
    };
  }
  if (!tool) {
    return {
      key: cleanKey,
      tool: cleanTool,
      status: 'error',
      message: `"${cleanTool}" is not an action ${spec.label} exposes. Use one of: ${spec.tools.map((entry) => entry.id).join(', ')}.`,
    };
  }
  if (!connected) {
    return {
      key: cleanKey,
      tool: cleanTool,
      status: 'error',
      message: `${spec.label} is installed but not connected to an account yet, so nothing could be read. Tell the operator to connect it on the Connectors page.`,
    };
  }
  if (tool.write && (access === 'read' || !autoApprove)) {
    return {
      key: cleanKey,
      tool: cleanTool,
      status: 'gated',
      message: `${spec.label} is not allowed to write: ${access === 'read' ? 'its access is read-only' : 'auto-approve is off'}. Nothing was sent. Tell the operator the exact action and that granting ${access === 'read' ? 'read/write access' : 'auto-approve'} on the Connectors page lets it run next time.`,
    };
  }
  for (const param of tool.params) {
    if (param.required && !String(params?.[param.name] ?? '').trim()) {
      return { key: cleanKey, tool: cleanTool, status: 'error', message: `"${param.name}" is required for ${cleanTool}.` };
    }
  }

  try {
    const token = await resolveAccessToken(base44, cleanKey);
    if (!token) {
      return {
        key: cleanKey,
        tool: cleanTool,
        status: 'error',
        message: `${spec.label} has no live token, so nothing was read. Tell the operator to reconnect it on the Connectors page.`,
      };
    }

    const built = tool.request(params || {});
    const response = await fetch(built.url, {
      method: built.method,
      headers: { Authorization: `Bearer ${token}`, ...(built.headers || {}) },
      ...(built.body ? { body: typeof built.body === 'string' ? built.body : JSON.stringify(built.body) } : {}),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    const text = await response.text();

    if (!response.ok) {
      return {
        key: cleanKey,
        tool: cleanTool,
        status: 'error',
        message: `${spec.label} answered ${response.status}: ${compact(text.slice(0, 600))}`,
      };
    }
    return { key: cleanKey, tool: cleanTool, status: 'ok', message: summarize(text) || 'Done, with an empty response.' };
  } catch (error: any) {
    return {
      key: cleanKey,
      tool: cleanTool,
      status: 'error',
      message: `${spec.label} could not be reached: ${String(error?.message || error).slice(0, 300)}`,
    };
  }
}