import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
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
} from 'lucide-react';
import SessionList from '@/components/SessionList';
import ProjectList from '@/components/shell/ProjectList';
import NotificationBell from '@/components/shell/NotificationBell';
import UsageMeter from '@/components/shell/UsageMeter';

const NAV = [
  { to: '/library', label: 'All tasks', icon: LayoutList },
  { to: '/agents', label: 'Agents', icon: Bot },
  { to: '/skills', label: 'Skills', icon: Sparkles },
  { to: '/automations', label: 'Scheduled', icon: Repeat },
  { to: '/computers', label: 'Computers', icon: Monitor },
  { to: '/artifacts', label: 'Library', icon: FileStack },
  { to: '/files', label: 'Files', icon: FolderOpen },
  { to: '/websites', label: 'Websites', icon: Globe },
  { to: '/templates', label: 'Templates', icon: Layers },
  { to: '/playbooks', label: 'Playbooks', icon: BookOpen },
  { to: '/releases', label: 'Releases', icon: Rocket },
  { to: '/plugins', label: 'Connectors', icon: Plug },
];

export default function SidebarBody({ tasks, projects, onNavigate }) {
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
      <div className="px-2.5">
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

        <nav className="mt-0.5 space-y-0.5">
          {NAV.map(({ to, label, icon: Icon }) => (
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
        </nav>
      </div>

      <div className="mt-4 min-h-0 flex-1 overflow-y-auto scroll-thin px-2.5 pb-3">
        <ProjectList projects={projects} />
        <div className="mt-4">
          <SessionList tasks={tasks} />
        </div>
      </div>

      <div className="shrink-0 px-2.5 pb-1">
        <NavLink
          to="/settings"
          onClick={onNavigate}
          className={({ isActive }) =>
            `nav-row flex items-center gap-2 rounded-lg px-2.5 py-[7px] text-[13px] transition-colors ${
              isActive
                ? 'bg-sidebar-accent font-medium text-sidebar-accent-foreground'
                : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/70'
            }`
          }
        >
          <Settings size={15} strokeWidth={1.7} className="text-muted-foreground" />
          Settings
        </NavLink>
        <UsageMeter />
      </div>

      <div className="flex items-center justify-between border-t border-sidebar-border px-4 py-1.5">
        <span className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground">Inbox</span>
        <NotificationBell />
      </div>
    </div>
  );
}