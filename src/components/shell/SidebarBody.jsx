import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  ChevronDown,
  Loader2,
  LayoutList,
  Bot,
  Sparkles,
  Repeat,
  Monitor,
  FileStack,
  FolderOpen,
  Globe,
  Layers,
  BookOpen,
  Rocket,
  Plug,
  Settings,
  ShieldCheck,
  ShieldHalf,
  Clapperboard,
  Radio,
  Eye,
  Scale,
} from 'lucide-react';
import SessionList from '@/components/SessionList';
import ProjectList from '@/components/shell/ProjectList';
import NotificationBell from '@/components/shell/NotificationBell';
import UsageMeter from '@/components/shell/UsageMeter';

const NAV_SECTIONS = [
  {
    label: 'Control',
    items: [
      { to: '/truth', label: 'Reality check', icon: Eye },
      { to: '/parity', label: 'Parity register', icon: Scale },
      { to: '/guardian', label: 'Guardian', icon: ShieldHalf },
      { to: '/admin', label: 'Control plane', icon: ShieldCheck },
      { to: '/autopilot', label: 'Autopilot', icon: Rocket },
    ],
  },
  {
    label: 'Workspace',
    items: [
      { to: '/library', label: 'Tasks', icon: LayoutList },
      { to: '/artifacts', label: 'Artifacts', icon: FileStack },
      { to: '/files', label: 'Files', icon: FolderOpen },
    ],
  },
  {
    label: 'Build',
    items: [
      { to: '/templates', label: 'Templates', icon: Layers },
      { to: '/playbooks', label: 'Playbooks', icon: BookOpen },
      { to: '/websites', label: 'Websites', icon: Globe },
      { to: '/releases', label: 'Releases', icon: Rocket },
    ],
  },
  {
    label: 'Agents',
    items: [
      { to: '/agents', label: 'Agents', icon: Bot },
      { to: '/skills', label: 'Skills', icon: Sparkles },
      { to: '/automations', label: 'Scheduled', icon: Repeat },
      { to: '/computers', label: 'Computers', icon: Monitor },
    ],
  },
  {
    label: 'Connect',
    items: [{ to: '/plugins', label: 'Connectors', icon: Plug }],
  },
  {
    label: 'Media',
    items: [
      { to: '/video', label: 'Video studio', icon: Clapperboard },
      { to: '/live', label: 'Live avatar', icon: Radio },
    ],
  },
];

export default function SidebarBody({ tasks, projects, onNavigate, hasMore, onLoadMore, loadingMore }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const submit = (event) => {
    event.preventDefault();
    const term = query.trim();
    if (!term) return;
    navigate(`/search?q=${encodeURIComponent(term)}`);
    setQuery('');
    if (onNavigate) onNavigate();
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto scroll-thin px-2.5 pb-2">
        <button
          type="button"
          onClick={() => {
            navigate('/new');
            if (onNavigate) onNavigate();
          }}
          className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-[13px] font-medium transition-colors hover:bg-sidebar-accent"
        >
          <Plus size={15} strokeWidth={1.9} className="text-muted-foreground" />
          New task
        </button>

        <form onSubmit={submit} className="mt-0.5">
          <label className="flex items-center gap-2 rounded-lg px-2.5 py-[7px] text-[13px] text-sidebar-foreground/80 transition-colors focus-within:bg-sidebar-accent hover:bg-sidebar-accent/70">
            <Search size={15} strokeWidth={1.7} className="shrink-0 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search"
              aria-label="Search everything"
              className="w-full bg-transparent outline-none placeholder:text-sidebar-foreground/60"
            />
          </label>
        </form>

        <nav className="mt-1 space-y-2.5">
          {NAV_SECTIONS.map((section) => (
            <div key={section.label} className="space-y-0.5">
              <p className="px-2.5 pb-0.5 text-[9.5px] uppercase tracking-[0.1em] text-muted-foreground/70">
                {section.label}
              </p>
              {section.items.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    `nav-row flex items-center gap-2 rounded-lg px-2.5 py-[7px] text-[13px] transition-colors ${
                      isActive
                        ? 'bg-sidebar-accent font-medium text-sidebar-accent-foreground'
                        : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/70'
                    }`
                  }
                >
                  <Icon size={15} strokeWidth={1.7} className="text-muted-foreground" />
                  {label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className="mt-4">
          <ProjectList projects={projects} tasks={tasks} onNavigate={onNavigate} />
          <div className="mt-4">
            <SessionList tasks={tasks} projects={projects} onNavigate={onNavigate} />
          </div>
          {hasMore && (
            <button
              type="button"
              onClick={onLoadMore}
              disabled={loadingMore}
              className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground disabled:opacity-50"
            >
              {loadingMore ? <Loader2 size={11} className="animate-spin" /> : <ChevronDown size={11} />} Show more
            </button>
          )}
          <UsageMeter />
        </div>
      </div>

      <div className="shrink-0 border-t border-sidebar-border px-2.5 py-1.5">
        <div className="flex items-center gap-1">
          <NavLink
            to="/settings"
            onClick={onNavigate}
            className={({ isActive }) =>
              `nav-row flex flex-1 items-center gap-2 rounded-lg px-2.5 py-[7px] text-[13px] transition-colors ${
                isActive
                  ? 'bg-sidebar-accent font-medium text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/70'
              }`
            }
          >
            <Settings size={15} strokeWidth={1.7} className="text-muted-foreground" />
            Settings
          </NavLink>
          <NotificationBell />
        </div>
      </div>
    </div>
  );
}