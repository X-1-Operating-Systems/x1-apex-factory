import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { LayoutGrid, Layers, Rocket, LogOut } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import ThemeToggle from '@/components/ThemeToggle';

const NAV = [
  { to: '/', label: 'Projects', icon: LayoutGrid, end: true },
  { to: '/templates', label: 'Templates', icon: Layers },
  { to: '/releases', label: 'Releases', icon: Rocket },
];

function Wordmark() {
  return (
    <div className="flex items-center gap-3">
      <div className="glass-blue grid h-9 w-9 place-items-center rounded-[10px] display-title text-[15px] tracking-tight">
        X1
      </div>
      <div className="leading-tight">
        <p className="text-[14px] font-semibold tracking-tight">X1 Studio</p>
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Build systems</p>
      </div>
    </div>
  );
}

export default function AppShell() {
  const { user } = useAuth();

  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="hidden w-[248px] shrink-0 flex-col border-r border-border px-4 py-6 lg:flex">
        <div className="px-2">
          <Wordmark />
        </div>

        <nav className="mt-9 flex flex-col gap-1">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-colors ${
                  isActive ? 'bg-card text-foreground hairline' : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                }`
              }
            >
              <Icon size={16} strokeWidth={1.8} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto space-y-3 border-t border-border pt-4">
          <div className="flex items-center justify-between px-2">
            <span className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Theme</span>
            <ThemeToggle compact />
          </div>
          <div className="flex items-center justify-between gap-2 rounded-lg bg-card px-3 py-2 hairline">
            <div className="min-w-0">
              <p className="truncate text-[12px] font-medium">{user?.full_name || 'Studio operator'}</p>
              <p className="truncate text-[11px] text-muted-foreground">{user?.email || ''}</p>
            </div>
            <button
              type="button"
              onClick={() => base44.auth.logout()}
              aria-label="Sign out"
              className="shrink-0 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-3 border-b border-border px-4 py-3 lg:hidden">
          <Wordmark />
          <ThemeToggle compact />
        </header>
        <nav className="flex gap-1 overflow-x-auto border-b border-border px-3 py-2 lg:hidden">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex shrink-0 items-center gap-2 rounded-full px-3 py-1.5 text-[12px] font-medium ${
                  isActive ? 'glass-blue' : 'text-muted-foreground'
                }`
              }
            >
              <Icon size={14} strokeWidth={1.8} />
              {label}
            </NavLink>
          ))}
        </nav>

        <main className="min-h-0 flex-1 overflow-y-auto scroll-thin">
          <Outlet />
        </main>
      </div>
    </div>
  );
}