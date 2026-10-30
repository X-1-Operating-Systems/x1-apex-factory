import { base44 } from '@/api/base44Client';

const TYPE_MIME = {
  image: '^image/',
  document: '^(text/|application/)',
  video: '^video/',
  audio: '^audio/',
};

export function fileFilter({ query = '', type = '' } = {}) {
  const term = String(query).trim();
  const clauses = [];
  if (term) clauses.push({ $or: [{ name: { $regex: term } }, { task_title: { $regex: term } }] });
  const mime = TYPE_MIME[type];
  if (mime) clauses.push({ mime_type: { $regex: mime } });
  if (!clauses.length) return {};
  return clauses.length === 1 ? clauses[0] : { $and: clauses };
}

export async function listFiles({ query = '', type = '', limit = 30, cursor } = {}) {
  return base44.entities.StudioFile.filter(fileFilter({ query, type }), { sort: '-created_date', limit, cursor });
}

export async function countFiles({ query = '', type = '' } = {}) {
  return base44.entities.StudioFile.count(fileFilter({ query, type }));
}

export async function openFile(file) {
  const { signed_url } = await base44.integrations.Core.CreateFileSignedUrl({
    file_uri: file.file_uri,
    expires_in: 900,
  });
  window.open(signed_url, '_blank', 'noreferrer');
}

export async function removeFile(id) {
  return base44.entities.StudioFile.delete(id);
}

export async function registerFiles(files, { task, source = 'task', project_id = '' } = {}) {
  if (!files?.length) return [];
  return base44.entities.StudioFile.bulkCreate(
    files.map((file) => ({
      name: file.name,
      file_uri: file.file_uri,
      mime_type: file.mime_type || '',
      size: Number(file.size) || 0,
      task_id: task?.id || '',
      task_title: task?.title || '',
      project_id: project_id || '',
      source,
    }))
  );
}

export async function listProjectFiles(projectId, limit = 20) {
  if (!projectId) return { items: [] };
  return base44.entities.StudioFile.filter({ project_id: projectId }, { sort: '-created_date', limit });
}

export function prettySize(bytes) {
  const value = Number(bytes) || 0;
  if (!value) return '';
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${Math.round(value / 1024)} KB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}