import React, { useEffect, useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { LogOut, Menu, Sparkles } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import ThemeToggle from '@/components/ThemeToggle';
import SidebarBody from '@/components/shell/SidebarBody';
import AccountMenu from '@/components/shell/AccountMenu';
import NotificationBell from '@/components/shell/NotificationBell';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { loadPreferences } from '@/lib/preferences';
import AIPanel from '@/components/ai/AIPanel';
import useStudioChat from '@/hooks/useStudioChat';
import { loadTaskOptions, saveTaskOptions } from '@/lib/taskOptions';

// The mark alone: an X and a 1 cut into one monogram, drawn rather than typed, so it holds its
// shape at every size and inverts cleanly in dark mode.
function Wordmark() {
  return (
    <Link to="/" aria-label="X1 Apex Factory" className="group inline-flex">
      <span className="relative grid h-8 w-8 place-items-center rounded-[10px] bg-foreground text-background shadow-[0_1px_2px_hsl(0_0%_0%/0.22)] transition-transform duration-300 ease-out group-hover:-rotate-6">
        <svg viewBox="0 0 28 28" className="h-[22px] w-[22px]" fill="none" aria-hidden="true">
          <rect
            x="0.75"
            y="0.75"
            width="26.5"
            height="26.5"
            rx="9"
            stroke="currentColor"
            strokeOpacity="0.18"
            strokeWidth="1"
          />
          <path d="M7.6 8.8 14 19.4M14 8.8 7.6 19.4" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" />
          <path
            d="M18.4 11.4 20.9 9.8V19.5"
            stroke="currentColor"
            strokeWidth="2.1"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </Link>
  );
}

const SIDEBAR_PAGE = 40;

export default function AppShell() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [chatOptions, setChatOptions] = useState(() => loadTaskOptions());
  const chat = useStudioChat({ model: chatOptions.model, effort: chatOptions.effort });
  const [taskPage, setTaskPage] = useState({ cursor: null, hasMore: false });
  const [projectPage, setProjectPage] = useState({ cursor: null, hasMore: false });
  const [loadingMore, setLoadingMore] = useState(false);

  const changeChatOptions = (next) => {
    setChatOptions(next);
    saveTaskOptions(next);
  };

  useEffect(() => {
    loadPreferences().catch(() => {});
  }, []);

  useEffect(() => {
    const load = async () => {
      const [tPage, pPage] = await Promise.all([
        base44.entities.StudioTask.filter({}, { sort: '-created_date', limit: SIDEBAR_PAGE }),
        base44.entities.Project.filter({}, { sort: '-updated_date', limit: SIDEBAR_PAGE }),
      ]);
      setTasks(tPage.items);
      setProjects(pPage.items);
      setTaskPage({ cursor: tPage.next_cursor, hasMore: Boolean(tPage.has_more) });
      setProjectPage({ cursor: pPage.next_cursor, hasMore: Boolean(pPage.has_more) });
    };
    load();
  }, []);

  // The sidebar shows a window on the whole workspace, not a fixed first page.
  const loadMore = async () => {
    if (loadingMore) return;
    setLoadingMore(true);
    try {
      const [tPage, pPage] = await Promise.all([
        taskPage.hasMore
          ? base44.entities.StudioTask.filter({}, { sort: '-created_date', limit: SIDEBAR_PAGE, cursor: taskPage.cursor })
          : null,
        projectPage.hasMore
          ? base44.entities.Project.filter({}, { sort: '-updated_date', limit: SIDEBAR_PAGE, cursor: projectPage.cursor })
          : null,
      ]);
      const merge = (prev, page) => {
        if (!page) return prev;
        const seen = new Set(prev.map((item) => item.id));
        return [...prev, ...page.items.filter((item) => !seen.has(item.id))];
      };
      if (tPage) {
        setTasks((prev) => merge(prev, tPage));
        setTaskPage({ cursor: tPage.next_cursor, hasMore: Boolean(tPage.has_more) });
      }
      if (pPage) {
        setProjects((prev) => merge(prev, pPage));
        setProjectPage({ cursor: pPage.next_cursor, hasMore: Boolean(pPage.has_more) });
      }
    } finally {
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    const onKey = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        navigate('/search');
      }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'j') {
        event.preventDefault();
        setAiOpen((open) => !open);
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
      <aside className="hidden w-[232px] shrink-0 flex-col border-r border-sidebar-border bg-sidebar md:flex xl:w-[264px]">
        <div className="flex h-[54px] shrink-0 items-center justify-between px-4">
          <Wordmark />
          <ThemeToggle compact />
        </div>

        <SidebarBody
          tasks={tasks}
          projects={projects}
          hasMore={taskPage.hasMore || projectPage.hasMore}
          onLoadMore={loadMore}
          loadingMore={loadingMore}
        />

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
        <header className="flex h-[52px] shrink-0 items-center justify-between border-b border-border bg-background px-3 md:hidden">
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
                  hasMore={taskPage.hasMore || projectPage.hasMore}
                  onLoadMore={loadMore}
                  loadingMore={loadingMore}
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

      {!aiOpen && (
        <button
          type="button"
          onClick={() => setAiOpen(true)}
          aria-label="Ask the studio"
          className="fixed bottom-4 right-4 z-30 inline-flex items-center gap-1.5 rounded-full bg-foreground px-3.5 py-2 text-[11.5px] font-medium text-background shadow-lg transition-opacity hover:opacity-90"
        >
          <Sparkles size={12} /> Ask
        </button>
      )}

      <AIPanel
        open={aiOpen}
        onClose={() => setAiOpen(false)}
        chat={chat}
        options={chatOptions}
        onOptionsChange={changeChatOptions}
      />
    </div>
  );
}