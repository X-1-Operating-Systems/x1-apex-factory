import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Plus, Layers, Rocket, LogOut, Search } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import ThemeToggle from '@/components/ThemeToggle';
import SessionList from '@/components/SessionList';

const NAV = [
  { to: '/templates', label: 'Templates', icon: Layers },
  { to: '/releases', label: 'Releases', icon: Rocket },
];

function Wordmark() {
  return (
    <div className="flex items-center gap-2">
      <div className="grid h-[26px] w-[26px] place-items-center rounded-[7px] bg-foreground text-[10.5px] font-semibold tracking-tight text-background">
        X1
      </div>
      <span className="text-[13.5px] font-medium tracking-tight">apex factory</span>
    </div>
  );
}

export default function AppShell() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const load = async () => {
      const page = await base44.entities.Project.filter({}, { sort: '-updated_date', limit: 60 });
      setProjects(page.items);
    };
    load();
  }, []);

  const initials = (user?.full_name || user?.email || 'X')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <aside className="hidden w-[264px] shrink-0 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
        <div className="flex h-[54px] shrink-0 items-center justify-between px-4">
          <Wordmark />
          <ThemeToggle compact />
        </div>

        <div className="px-2.5">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-[13px] font-medium transition-colors hover:bg-sidebar-accent"
          >
            <Plus size={15} strokeWidth={1.9} className="text-muted-foreground" />
            New task
          </button>

          <label className="mt-0.5 flex items-center gap-2 rounded-lg px-2.5 py-[7px] text-[13px] text-sidebar-foreground/80 transition-colors focus-within:bg-sidebar-accent hover:bg-sidebar-accent/70">
            <Search size={15} strokeWidth={1.7} className="shrink-0 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search"
              className="w-full bg-transparent outline-none placeholder:text-sidebar-foreground/60"
            />
          </label>

          <nav className="mt-0.5 space-y-0.5">
            {NAV.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-lg px-2.5 py-[7px] text-[13px] transition-colors ${
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
          <SessionList
            projects={
              query.trim()
                ? projects.filter((p) =>
                    `${p.name} ${p.client_name || ''}`.toLowerCase().includes(query.trim().toLowerCase())
                  )
                : projects
            }
          />
        </div>

        <div className="shrink-0 border-t border-sidebar-border p-2.5">
          <div className="flex items-center gap-2 rounded-lg px-1.5 py-1.5">
            <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-secondary text-[10.5px] font-medium text-foreground">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[12px] font-medium leading-tight">{user?.full_name || 'Studio operator'}</p>
              <p className="truncate text-[10.5px] leading-tight text-muted-foreground">Studio plan</p>
            </div>
            <button
              type="button"
              onClick={() => base44.auth.logout()}
              aria-label="Sign out"
              className="shrink-0 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-[52px] shrink-0 items-center justify-between border-b border-border bg-background px-4 lg:hidden">
          <Wordmark />
          <div className="flex items-center gap-1">
            {NAV.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                aria-label={label}
                className={({ isActive }) =>
                  `grid h-8 w-8 place-items-center rounded-full ${
                    isActive ? 'bg-foreground text-background' : 'text-muted-foreground'
                  }`
                }
              >
                <Icon size={15} strokeWidth={1.8} />
              </NavLink>
            ))}
            <ThemeToggle compact />
          </div>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto scroll-thin">
          <Outlet />
        </main>
      </div>
    </div>
  );
}