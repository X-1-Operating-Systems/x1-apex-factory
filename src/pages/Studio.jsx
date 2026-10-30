import React, { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import PageCanvas from '@/components/studio/PageCanvas';
import TaskThread from '@/components/studio/TaskThread';
import TaskComposer from '@/components/studio/TaskComposer';
import Inspector from '@/components/studio/Inspector';
import QaPanel from '@/components/studio/QaPanel';
import ProjectSettingsDialog from '@/components/studio/ProjectSettingsDialog';
import PageSwitcher from '@/components/studio/PageSwitcher';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { blockHash, uid } from '@/components/studio/blockTheme';
import {
  ArrowLeft,
  ArrowRight,
  Loader2,
  Lock,
  Monitor,
  PanelRight,
  Plus,
  Rocket,
  RotateCw,
  ShieldCheck,
  SlidersHorizontal,
  Smartphone,
  Tablet,
} from 'lucide-react';

const VIEWPORTS = [
  { key: 'desktop', width: '100%', icon: Monitor, label: 'Desktop' },
  { key: 'tablet', width: 768, icon: Tablet, label: 'Tablet' },
  { key: 'mobile', width: 390, icon: Smartphone, label: 'Mobile' },
];

export default function Studio() {
  const { id } = useParams();
  const { toast } = useToast();

  const [project, setProject] = useState(null);
  const [pages, setPages] = useState([]);
  const [pageId, setPageId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [saving, setSaving] = useState(false);
  const [busy, setBusy] = useState(false);
  const [viewport, setViewport] = useState('desktop');
  const [run, setRun] = useState(null);
  const [qaBusy, setQaBusy] = useState(false);
  const [qaOpen, setQaOpen] = useState(false);
  const [releaseOpen, setReleaseOpen] = useState(false);
  const [releasing, setReleasing] = useState(false);
  const [target, setTarget] = useState('vercel');
  const [canvasOpen, setCanvasOpen] = useState(false);
  const [designOpen, setDesignOpen] = useState(false);

  const [settingsOpen, setSettingsOpen] = useState(false);

  const saveTimer = useRef(null);
  const page = pages.find((entry) => entry.id === pageId) || pages[0] || null;

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const record = await base44.entities.Project.get(id);
        const pageResult = await base44.entities.StudioPage.filter({ project_id: id }, { sort: 'created_date', limit: 50 });
        let list = pageResult.items || [];
        if (!list.length) {
          const first = await base44.entities.StudioPage.create({
            project_id: id,
            name: 'Home',
            path: '/',
            version: 1,
            blocks: [],
            seo_title: record.name,
            seo_description: record.description || '',
          });
          list = [first];
        }
        const current = list[0];
        const messageResult = await base44.entities.StudioMessage.filter({ project_id: id }, { sort: 'created_date', limit: 200 });
        if (!alive) return;
        setProject(record);
        setPages(list.map((entry) => ({ ...entry, blocks: entry.blocks || [] })));
        setPageId(current.id);
        setMessages(messageResult.items);
        setSelectedId(current.blocks?.[0]?.id || null);
        setTarget(record.deploy_target || 'vercel');
        setLoading(false);
      } catch (err) {
        if (!alive) return;
        setNotFound(true);
        setLoading(false);
      }
    };
    load();
    return () => {
      alive = false;
      clearTimeout(saveTimer.current);
    };
  }, [id]);

  const queueSave = (next) => {
    setPages((prev) => prev.map((entry) => (entry.id === next.id ? next : entry)));
    setSaving(true);
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      await base44.entities.StudioPage.update(next.id, {
        blocks: next.blocks,
        seo_title: next.seo_title || '',
        seo_description: next.seo_description || '',
        version: next.version,
      });
      setSaving(false);
    }, 700);
  };

  const changeTokens = async (patch) => {
    setProject((prev) => ({ ...prev, ...patch }));
    await base44.entities.Project.update(project.id, patch);
  };

  const selectPage = (nextId) => {
    const next = pages.find((entry) => entry.id === nextId);
    if (!next) return;
    clearTimeout(saveTimer.current);
    setSaving(false);
    setPageId(next.id);
    setSelectedId((next.blocks || [])[0]?.id || null);
  };

  const createPage = async ({ name, path }) => {
    const created = await base44.entities.StudioPage.create({
      project_id: id,
      name,
      path,
      version: 1,
      blocks: [],
      seo_title: `${project.name} · ${name}`,
      seo_description: '',
    });
    const entry = { ...created, blocks: created.blocks || [] };
    setPages((prev) => [...prev, entry]);
    setPageId(entry.id);
    setSelectedId(null);
  };

  const savePageMeta = async (nextId, patch) => {
    await base44.entities.StudioPage.update(nextId, patch);
    setPages((prev) => prev.map((entry) => (entry.id === nextId ? { ...entry, ...patch } : entry)));
  };

  const deletePage = async (nextId) => {
    if (pages.length < 2) return;
    await base44.entities.StudioPage.delete(nextId);
    const rest = pages.filter((entry) => entry.id !== nextId);
    setPages(rest);
    if (nextId === pageId) {
      setPageId(rest[0].id);
      setSelectedId((rest[0].blocks || [])[0]?.id || null);
    }
  };

  const send = async (text, attachments) => {
    setBusy(true);
    try {
      const userMessage = await base44.entities.StudioMessage.create({
        project_id: id,
        role: 'user',
        content: text,
        attachments: attachments || [],
      });
      setMessages((prev) => [...prev, userMessage]);

      const response = await base44.functions.invoke('studioAgent', {
        project: {
          name: project.name,
          client_name: project.client_name,
          accent: project.accent,
          surface: project.surface,
          headline_font: project.headline_font,
        },
        page: {
          name: page.name,
          path: page.path,
          blocks: page.blocks,
          seo_title: page.seo_title,
          seo_description: page.seo_description,
        },
        instruction: text,
        siblings: pages.filter((entry) => entry.id !== page.id).map((entry) => `${entry.name} (${entry.path || '/'})`),
        attachment_urls: (attachments || []).map((a) => a.file_url),
        history: messages.slice(-8).map((m) => ({ role: m.role, content: m.content })),
      });

      const data = response.data;
      const blocks = (data.blocks || []).map((b) => ({
        id: b.id || uid(b.type || 'block'),
        type: b.type,
        props: b.props || {},
      }));
      const tokens = data.tokens || {};
      const nextVersion = (page.version || 1) + 1;

      await base44.entities.StudioPage.update(page.id, {
        blocks,
        version: nextVersion,
        seo_title: data.seo?.title || page.seo_title || '',
        seo_description: data.seo?.description || page.seo_description || '',
      });

      setPages((prev) =>
        prev.map((entry) =>
          entry.id === page.id
            ? {
                ...entry,
                blocks,
                version: nextVersion,
                seo_title: data.seo?.title || entry.seo_title,
                seo_description: data.seo?.description || entry.seo_description,
              }
            : entry
        )
      );
      setSelectedId(blocks[0]?.id || null);

      const projectPatch = {
        accent: tokens.accent || project.accent,
        surface: tokens.surface || project.surface,
        headline_font: tokens.headlineFont || project.headline_font,
        status: 'editing',
      };
      await base44.entities.Project.update(project.id, projectPatch);
      setProject((prev) => ({ ...prev, ...projectPatch }));

      const assistantMessage = await base44.entities.StudioMessage.create({
        project_id: id,
        role: 'assistant',
        content: data.reply || 'Canvas updated.',
        summary: data.summary || `v${nextVersion} · ${blocks.length} sections`,
      });
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      toast({
        title: 'The change did not apply',
        description: err?.response?.data?.error || err?.message || 'Try rephrasing the instruction.',
        variant: 'destructive',
      });
    } finally {
      setBusy(false);
    }
  };

  const evaluate = async () => {
    const response = await base44.functions.invoke('qaAudit', {
      project: { name: project.name, client_name: project.client_name },
      page: {
        name: page.name,
        path: page.path,
        blocks: page.blocks,
        seo_title: page.seo_title,
        seo_description: page.seo_description,
      },
      tokens: { accent: project.accent, surface: project.surface },
    });
    return response.data;
  };

  const storeRun = async (data) => {
    const stored = await base44.entities.QaRun.create({
      project_id: id,
      project_name: project.name,
      verdict: data.verdict,
      score: data.score,
      checks: data.checks,
      findings: data.findings,
      page_version: page.version,
    });
    setRun(stored);
    return stored;
  };

  const runQa = async () => {
    setQaBusy(true);
    try {
      const data = await evaluate();
      await storeRun(data);
      const updated = await base44.entities.Project.update(project.id, {
        status: data.verdict === 'pass' ? 'ready' : 'review',
      });
      setProject(updated);
      setQaOpen(true);
    } catch (err) {
      toast({ title: 'Review failed to run', description: err?.message, variant: 'destructive' });
    } finally {
      setQaBusy(false);
    }
  };

  const prepareRelease = async () => {
    setReleasing(true);
    try {
      const res = await base44.functions.invoke('deployRelease', { action: 'run', project_id: id, target });
      const passed = res.data.deployment.status === 'ready_for_approval';
      setProject(res.data.project);
      setReleaseOpen(false);
      toast({
        title: passed ? 'Release manifest prepared' : 'Release blocked',
        description: passed
          ? 'The record is waiting in Releases for your approval.'
          : 'Read the review findings, fix them, then prepare again.',
      });
    } catch (err) {
      toast({ title: 'Could not prepare the release', description: err?.message, variant: 'destructive' });
    } finally {
      setReleasing(false);
    }
  };

  if (loading) {
    return (
      <div className="grid h-full place-items-center">
        <Loader2 className="animate-spin text-muted-foreground" size={20} />
      </div>
    );
  }

  if (notFound || !project || !page) {
    return (
      <div className="grid h-full place-items-center px-6 text-center">
        <div>
          <p className="display-title text-2xl">This project is not available</p>
          <p className="mt-2 text-[13px] text-muted-foreground">It may have been removed, or it belongs to another account.</p>
          <Link to="/" className="mt-4 inline-block text-[12.5px] font-medium text-primary">Back to projects</Link>
        </div>
      </div>
    );
  }

  const tokens = { accent: project.accent || '#b4532a', surface: project.surface || 'light', headlineFont: project.headline_font || 'serif' };
  const active = VIEWPORTS.find((v) => v.key === viewport) || VIEWPORTS[0];
  const siteSlug = `${project.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}.x1.dev`;

  const inspector = (
    <Inspector
      blocks={page.blocks || []}
      selectedId={selectedId}
      onSelect={setSelectedId}
      onMove={(blockId, dir) => {
        const list = [...page.blocks];
        const from = list.findIndex((b) => b.id === blockId);
        const to = from + dir;
        if (from < 0 || to < 0 || to >= list.length) return;
        const [item] = list.splice(from, 1);
        list.splice(to, 0, item);
        queueSave({ ...page, blocks: list });
      }}
      onDelete={(blockId) => queueSave({ ...page, blocks: page.blocks.filter((b) => b.id !== blockId) })}
      onDuplicate={(blockId) => {
        const index = page.blocks.findIndex((b) => b.id === blockId);
        if (index < 0) return;
        const copy = { ...page.blocks[index], id: uid(page.blocks[index].type) };
        const list = [...page.blocks];
        list.splice(index + 1, 0, copy);
        queueSave({ ...page, blocks: list });
        setSelectedId(copy.id);
      }}
      onAdd={(block) => {
        const index = page.blocks.findIndex((b) => b.id === selectedId);
        const list = [...page.blocks];
        list.splice(index < 0 ? list.length : index + 1, 0, block);
        queueSave({ ...page, blocks: list });
        setSelectedId(block.id);
      }}
      onUpdateProps={(blockId, patch) =>
        queueSave({
          ...page,
          blocks: page.blocks.map((b) => (b.id === blockId ? { ...b, props: { ...b.props, ...patch } } : b)),
        })
      }
      tokens={tokens}
      onTokenChange={changeTokens}
      seo={{ title: page.seo_title, description: page.seo_description }}
      onSeoChange={(patch) =>
        queueSave({
          ...page,
          seo_title: patch.title !== undefined ? patch.title : page.seo_title,
          seo_description: patch.description !== undefined ? patch.description : page.seo_description,
        })
      }
    />
  );

  const canvasPanel = (
    <div className="flex h-full min-h-0 flex-col bg-background">
      <div className="flex h-[46px] shrink-0 items-center gap-2 border-b border-border px-3">
        <div className="flex shrink-0 items-center gap-1.5 text-muted-foreground/70">
          <ArrowLeft size={12} />
          <ArrowRight size={12} />
          <RotateCw size={11} />
        </div>
        <div className="mx-auto flex h-6 min-w-0 max-w-[320px] flex-1 items-center justify-center gap-1.5 rounded-full bg-secondary px-3">
          <Lock size={9} className="shrink-0 text-muted-foreground" />
          <span className="truncate text-[10.5px] text-muted-foreground">
            {siteSlug}
            {page.path === '/' ? '' : page.path}
          </span>
        </div>
        <div className="hidden shrink-0 items-center gap-0.5 rounded-full border border-border p-0.5 sm:flex">
          {VIEWPORTS.map((v) => {
            const Icon = v.icon;
            return (
              <button
                key={v.key}
                type="button"
                onClick={() => setViewport(v.key)}
                aria-label={v.label}
                className={`grid h-6 w-6 place-items-center rounded-full transition-colors ${
                  viewport === v.key ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon size={12} />
              </button>
            );
          })}
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-auto scroll-thin bg-secondary/40 p-3" onClick={() => setSelectedId(null)}>
        <div
          className="mx-auto overflow-hidden rounded-lg border border-border bg-card"
          style={{ width: '100%', maxWidth: active.width }}
        >
          <PageCanvas blocks={page.blocks || []} tokens={tokens} selectedId={selectedId} onSelect={setSelectedId} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-full min-h-0 bg-background">
      <div className="relative flex min-w-0 flex-1 flex-col">
        <header className="flex h-[52px] shrink-0 items-center justify-between gap-2 border-b border-border bg-background px-3 lg:px-5">
          <div className="flex min-w-0 items-center gap-2">
            <Link
              to="/"
              className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              aria-label="Back to tasks"
            >
              <ArrowLeft size={15} />
            </Link>
            <button
              type="button"
              onClick={() => setSettingsOpen(true)}
              title="Project settings and master instruction"
              className="max-w-[46vw] truncate rounded-md px-1 py-0.5 text-[13px] font-medium transition-colors hover:bg-secondary"
            >
              {project.name}
            </button>
            <PageSwitcher
              pages={pages}
              current={page}
              onSelect={selectPage}
              onCreate={createPage}
              onSave={savePageMeta}
              onDelete={deletePage}
            />
            <span className="hidden shrink-0 text-[11px] text-muted-foreground sm:inline">
              {saving ? 'Saving…' : `v${page.version}`}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setCanvasOpen(true)}
              aria-label="Open canvas"
              className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground xl:hidden"
            >
              <PanelRight size={15} />
            </button>
            <button
              type="button"
              onClick={() => setDesignOpen(true)}
              aria-label="Design inspector"
              className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <SlidersHorizontal size={14} />
            </button>
            <Link
              to={`/new?project=${project.id}`}
              title="Run a task inside this project"
              className="flex h-8 items-center gap-1.5 rounded-full border border-border px-2.5 text-[11.5px] font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <Plus size={13} />
              <span className="hidden sm:inline">Task</span>
            </Link>
            <button
              type="button"
              onClick={runQa}
              disabled={qaBusy}
              className="flex h-8 items-center gap-1.5 rounded-full border border-border px-2.5 text-[11.5px] font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-50"
            >
              {qaBusy ? <Loader2 size={13} className="animate-spin" /> : <ShieldCheck size={13} />}
              <span className="hidden sm:inline">Review</span>
            </button>
            <Button size="sm" className="h-8 gap-1.5 px-3" onClick={() => setReleaseOpen(true)}>
              <Rocket size={13} /> <span className="hidden sm:inline">Release</span>
            </Button>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto scroll-thin">
          <div className="mx-auto w-full max-w-[720px] px-5 pb-40 pt-6">
            <TaskThread
              messages={messages}
              busy={busy}
              page={page}
              project={project}
              onOpenCanvas={() => setCanvasOpen(true)}
              onReview={runQa}
              qaBusy={qaBusy}
              onSend={send}
            />
          </div>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-background via-background to-transparent px-4 pb-4 pt-10">
          <div className="pointer-events-auto mx-auto w-full max-w-[680px]">
            <TaskComposer onSend={send} busy={busy} />
            <p className="mt-1.5 text-center text-[10px] text-muted-foreground">
              Attachments are stored publicly — anyone with the link can open them.
            </p>
          </div>
        </div>
      </div>

      <div className="hidden w-[46%] max-w-[760px] shrink-0 border-l border-border xl:flex">{canvasPanel}</div>

      <Sheet open={canvasOpen} onOpenChange={setCanvasOpen}>
        <SheetContent side="right" className="w-full max-w-3xl p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Page canvas</SheetTitle>
          </SheetHeader>
          <div className="h-full">{canvasPanel}</div>
        </SheetContent>
      </Sheet>

      <Sheet open={designOpen} onOpenChange={setDesignOpen}>
        <SheetContent side="right" className="w-full max-w-sm p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Design inspector</SheetTitle>
          </SheetHeader>
          <div className="h-full pt-6">{inspector}</div>
        </SheetContent>
      </Sheet>

      <QaPanel open={qaOpen} onOpenChange={setQaOpen} run={run} />

      <ProjectSettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        project={project}
        onSaved={(patch) => setProject((prev) => ({ ...prev, ...patch }))}
      />

      <Dialog open={releaseOpen} onOpenChange={setReleaseOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[17px] font-medium">Prepare a release</DialogTitle>
            <DialogDescription>
              Every page in this project is reviewed together, then pinned with one manifest hash and handed to your approval queue.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div>
              <p className="text-[11.5px] text-muted-foreground">Target</p>
              <div className="mt-1.5 grid grid-cols-2 gap-1.5">
                {['vercel', 'railway', 'docker', 'github_pages'].map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setTarget(option)}
                    className={`rounded-md border px-2 py-2 text-[11.5px] capitalize transition-colors ${
                      target === option ? 'border-foreground bg-accent font-medium' : 'border-border text-muted-foreground'
                    }`}
                  >
                    {option.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-lg bg-accent px-3 py-2 text-[11.5px] leading-relaxed text-muted-foreground">
              {pages.length} page{pages.length === 1 ? '' : 's'} ·{' '}
              {pages.reduce((sum, entry) => sum + (entry.blocks?.length || 0), 0)} sections · manifest{' '}
              {blockHash(pages.map((entry) => ({ path: entry.path, blocks: entry.blocks })))}
            </div>

            <Button className="w-full" onClick={prepareRelease} disabled={releasing}>
              {releasing ? 'Reviewing…' : 'Review and prepare manifest'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}