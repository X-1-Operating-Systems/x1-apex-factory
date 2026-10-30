import React, { useEffect, useRef, useState } from 'react';
import { Loader2, Play, RefreshCw, Sparkles, Upload } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

// Her own artwork, byte for byte. The host stores it untouched and never asks a vendor's permission.
const HER_ARTWORK =
  'https://media.base44.com/images/public/6ae48ede6fd67187c24e94cd/51ca0aed5_EDEN_SKYE_LIVEAVATAR_CHEST_VISIBLE_1920x1080.png';

const call = async (action, extra = {}) => {
  const res = await base44.functions.invoke('avatar', { action, ...extra });
  return res.data || { ok: false, error: 'The avatar host returned nothing.' };
};

export default function OwnedAvatarStudio() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState(null);
  const [text, setText] = useState('I am Eden Skye, and this face is mine.');
  const [job, setJob] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [busy, setBusy] = useState(null);
  const [error, setError] = useState(null);
  const timer = useRef(null);

  const loadStatus = async () => {
    setLoading(true);
    const res = await call('status');
    setStatus(res);
    if (res.ok && res.host?.avatar) {
      const shot = await call('image.preview');
      setPreview(shot.ok ? shot.url : null);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadStatus().catch((e) => {
      setError(e.message);
      setLoading(false);
    });
    return () => clearInterval(timer.current);
  }, []);

  useEffect(() => {
    if (!job || job.status === 'done' || job.status === 'failed') return;
    timer.current = setInterval(async () => {
      const res = await call('render.get', { job_id: job.id });
      if (res.job) setJob(res.job);
      if (res.video_url) setVideoUrl(res.video_url);
      if (res.job?.status === 'done' || res.job?.status === 'failed') clearInterval(timer.current);
    }, 4000);
    return () => clearInterval(timer.current);
  }, [job]);

  const loadArtwork = async () => {
    setBusy('image');
    setError(null);
    const res = await call('image.set', { url: HER_ARTWORK });
    if (!res.ok) setError(res.error);
    await loadStatus();
    setBusy(null);
  };

  const renderHer = async () => {
    setBusy('render');
    setError(null);
    setVideoUrl(null);
    const res = await call('render', { text });
    if (!res.ok) setError(res.error);
    else setJob(res.job);
    setBusy(null);
  };

  const running = job && job.status !== 'done' && job.status !== 'failed';

  return (
    <section className="rounded-xl border border-border bg-card p-3">
      <div className="flex flex-wrap items-center gap-2">
        <Sparkles size={13} className="text-muted-foreground" />
        <h2 className="text-[12.5px] font-medium">Her own host</h2>
        <span className="text-[10.5px] text-muted-foreground">
          {loading ? 'checking' : status?.ok ? 'connected' : 'not reachable yet'}
        </span>
        <button
          type="button"
          onClick={loadStatus}
          className="ml-auto flex items-center gap-1 text-[10.5px] text-muted-foreground hover:text-foreground"
        >
          <RefreshCw size={11} /> Refresh
        </button>
      </div>

      <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
        Wav2Lip on our own container: her image goes in exactly as it is, no moderation and no vendor.
      </p>

      {error && <p className="mt-2 text-[11px] text-destructive">{error}</p>}
      {!loading && !status?.ok && status?.error && (
        <p className="mt-2 text-[11px] text-muted-foreground">{status.error}</p>
      )}

      <div className="mt-3 grid gap-3 sm:grid-cols-[168px_1fr]">
        <div className="overflow-hidden rounded-lg border border-border bg-secondary/40">
          {preview ? (
            <img src={preview} alt="Her still on the host" className="aspect-video w-full object-cover" />
          ) : (
            <div className="flex aspect-video items-center justify-center px-2 text-center text-[10.5px] text-muted-foreground">
              {status?.host?.avatar ? 'loading her image' : 'no image on the host yet'}
            </div>
          )}
        </div>

        <div className="min-w-0">
          <Textarea
            value={text}
            onChange={(event) => setText(event.target.value.slice(0, 20000))}
            rows={3}
            className="text-[12px]"
            placeholder="What should she say?"
          />
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Button size="sm" variant="outline" onClick={loadArtwork} disabled={busy === 'image'}>
              {busy === 'image' ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
              Load her artwork
            </Button>
            <Button size="sm" onClick={renderHer} disabled={busy === 'render' || running || !status?.ok}>
              {running ? <Loader2 size={12} className="animate-spin" /> : <Play size={12} />}
              {running ? job.status : 'Render her'}
            </Button>
            <span className="text-[10.5px] text-muted-foreground">
              {text.length}/20000 · CPU render, no length ceiling worth hitting
            </span>
          </div>
          {job?.status === 'failed' && <p className="mt-2 text-[11px] text-destructive">{job.error}</p>}
        </div>
      </div>

      {videoUrl && (
        <video src={videoUrl} controls playsInline className="mt-3 w-full rounded-lg border border-border" />
      )}
    </section>
  );
}