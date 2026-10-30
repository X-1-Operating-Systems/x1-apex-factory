import { base44 } from '@/api/base44Client';

const like = (value) => ({ $regex: value, $options: 'i' });
const deliverable = (term) => ({
  $or: [{ 'deliverable.name': like(term) }, { 'deliverable.detail': like(term) }],
});
const paged = (options, cursor) => ({ ...options, ...(cursor ? { cursor } : {}) });

/**
 * One spec per workspace surface. `run` returns a real page
 * ({ items, next_cursor, has_more }) so Search can page each surface on its own.
 */
export const SEARCH_SECTIONS = [
  {
    key: 'tasks',
    title: 'Tasks',
    limit: 12,
    run: (term, { limit, cursor }) =>
      base44.entities.StudioTask.filter(
        { $or: [{ title: like(term) }, { instruction: like(term) }] },
        paged({ sort: '-created_date', limit }, cursor)
      ),
  },
  {
    key: 'projects',
    title: 'Projects',
    limit: 8,
    run: (term, { limit, cursor }) =>
      base44.entities.Project.filter({ name: like(term) }, paged({ sort: '-updated_date', limit }, cursor)),
  },
  {
    key: 'websites',
    title: 'Websites',
    limit: 8,
    run: (term, { limit, cursor }) =>
      base44.entities.StudioTask.filter(
        { 'deliverable.type': 'website', ...deliverable(term) },
        paged({ sort: '-created_date', limit }, cursor)
      ),
  },
  {
    key: 'artifacts',
    title: 'Artifacts',
    limit: 12,
    run: (term, { limit, cursor }) =>
      base44.entities.StudioTask.filter(
        { 'deliverable.type': { $ne: 'website' }, ...deliverable(term) },
        paged({ sort: '-created_date', limit }, cursor)
      ),
  },
  {
    key: 'files',
    title: 'Files',
    limit: 8,
    run: (term, { limit, cursor }) =>
      base44.entities.StudioFile.filter({ name: like(term) }, paged({ sort: '-created_date', limit }, cursor)),
  },
  {
    key: 'agents',
    title: 'Agents',
    limit: 8,
    run: (term, { limit, cursor }) =>
      base44.entities.StudioAgent.filter({ name: like(term) }, paged({ limit }, cursor)),
  },
  {
    key: 'automations',
    title: 'Scheduled',
    limit: 8,
    run: (term, { limit, cursor }) =>
      base44.entities.Automation.filter({ title: like(term) }, paged({ limit }, cursor)),
  },
  {
    key: 'templates',
    title: 'Templates',
    limit: 8,
    run: (term, { limit, cursor }) =>
      base44.entities.Template.filter({ name: like(term) }, paged({ limit }, cursor)),
  },
];