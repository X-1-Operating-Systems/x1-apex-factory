import React, { useEffect, useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { LogOut, Menu } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import ThemeToggle from '@/components/ThemeToggle';
import SidebarBody from '@/components/shell/SidebarBody';
import AccountMenu from '@/components/shell/AccountMenu';
import NotificationBell from '@/components/shell/NotificationBell';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { loadPreferences } from '@/lib/preferences';

function Wordmark() {
  return (
    <Link to="/" className="flex items-center gap-2">
      <div className="grid h-[26px] w-[26px] place-items-center rounded-[7px] bg-foreground text-[10.5px] font-semibold tracking-tight text-background">
        X1
      </div>
      <span className="text-[13.5px] font-medium tracking-tight">apex factory</span>
    </Link>
  );
}

export default function AppShell() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    loadPreferences().catch(() => {});
  }, []);

  useEffect(() => {
    const load = async () => {
      const [taskPage, projectPage] = await Promise.all([
        base44.entities.StudioTask.filter({}, { sort: '-created_date', limit: 40 }),
        base44.entities.Project.filter({}, { sort: '-updated_date', limit: 40 }),
      ]);
      setTasks(taskPage.items);
      setProjects(projectPage.items);
    };
    load();
  }, []);

  useEffect(() => {
    const onKey = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        navigate('/search');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [navigate]);

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

        <SidebarBody tasks={tasks} projects={projects} />

        <div className="shrink-0 border-t border-sidebar-border p-2.5">
          <div className="flex items-center gap-2 rounded-lg px-1.5 py-1.5">
            <AccountMenu user={user} initials={initials} />
            <Link
              to="/settings/profile"
              className="min-w-0 flex-1 rounded-md px-0.5 py-0.5 transition-colors hover:text-foreground"
            >
              <p className="truncate text-[12px] font-medium leading-tight">{user?.full_name || 'Studio operator'}</p>
              <p className="truncate text-[10.5px] leading-tight text-muted-foreground">Profile &amp; settings</p>
            </Link>
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
        <header className="flex h-[52px] shrink-0 items-center justify-between border-b border-border bg-background px-3 lg:hidden">
          <div className="flex items-center gap-1.5">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <button
                  type="button"
                  aria-label="Open menu"
                  className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                >
                  <Menu size={16} />
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="flex w-[280px] flex-col p-0">
                <SheetTitle className="sr-only">Studio navigation</SheetTitle>
                <div className="flex h-[54px] shrink-0 items-center justify-between px-4">
                  <Wordmark />
                  <ThemeToggle compact />
                </div>
                <SidebarBody
                  tasks={tasks}
                  projects={projects}
                  onNavigate={() => setMobileOpen(false)}
                />
              </SheetContent>
            </Sheet>
            <Wordmark />
          </div>
          <div className="flex items-center gap-1.5">
            <NotificationBell />
            <AccountMenu user={user} initials={initials} />
          </div>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto scroll-thin">
          <Outlet />
        </main>
      </div>
    </div>
  );
}