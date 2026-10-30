import React, { useEffect, useState } from 'react';
import moment from 'moment';
import { Bell, Check, Loader2, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';

const KIND_LABEL = { task: 'Task', release: 'Release', automation: 'Automation', system: 'System' };

export default function Notifications() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const page = await base44.entities.Notification.filter({}, { sort: '-created_date', limit: 100 });
    setItems(page.items);
  };

  useEffect(() => {
    load().finally(() => setLoading(false));
    const unsubscribe = base44.entities.Notification.subscribe(() => load());
    return unsubscribe;
  }, []);

  const markAll = async () => {
    setBusy(true);
    await base44.entities.Notification.updateMany({ read: false }, { $set: { read: true } });
    await load();
    setBusy(false);
  };

  const toggle = async (item) => {
    await base44.entities.Notification.update(item.id, { read: !item.read });
    setItems((prev) => prev.map((n) => (n.id === item.id ? { ...n, read: !n.read } : n)));
  };

  const remove = async (item) => {
    await base44.entities.Notification.delete(item.id);
    setItems((prev) => prev.filter((n) => n.id !== item.id));
  };

  const unread = items.filter((n) => !n.read).length;

  return (
    <div className="mx-auto w-full max-w-[820px] px-5 py-8 lg:px-10 lg:py-10">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-[15px] font-medium">Notifications</h1>
          <p className="mt-1 text-[11.5px] text-muted-foreground">
            {items.length} total · {unread} unread
          </p>
        </div>
        <Button size="sm" variant="outline" className="gap-1.5" onClick={markAll} disabled={busy || unread === 0}>
          <Check size={12} /> Mark all read
        </Button>
      </div>

      {loading ? (
        <div className="mt-8 grid place-items-center py-14">
          <Loader2 size={16} className="animate-spin text-muted-foreground" />
        </div>
      ) : items.length === 0 ? (
        <div className="mt-8 rounded-xl border border-border bg-card px-5 py-12 text-center">
          <Bell size={18} className="mx-auto text-muted-foreground" />
          <p className="mt-2 text-[12.5px] font-medium">Your inbox is empty</p>
          <p className="mt-1 text-[11.5px] text-muted-foreground">
            Task completions, release approvals and scheduled runs post here.
          </p>
        </div>
      ) : (
        <div className="mt-4 divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
          {items.map((item) => (
            <div key={item.id} className="flex items-start gap-2.5 px-3.5 py-3">
              <button
                type="button"
                onClick={() => toggle(item)}
                aria-label={item.read ? 'Mark unread' : 'Mark read'}
                className={`mt-1.5 h-2 w-2 shrink-0 rounded-full transition-colors ${
                  item.read ? 'bg-border hover:bg-muted-foreground' : 'bg-foreground'
                }`}
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-1.5">
                  <p className={`text-[12.5px] ${item.read ? 'font-normal text-muted-foreground' : 'font-medium'}`}>
                    {item.title}
                  </p>
                  <span className="rounded-full border border-border px-1.5 py-0.5 text-[9.5px] uppercase tracking-wide text-muted-foreground">
                    {KIND_LABEL[item.kind] || 'System'}
                  </span>
                </div>
                {item.body && <p className="mt-0.5 text-[11.5px] leading-relaxed text-muted-foreground">{item.body}</p>}
                <div className="mt-1 flex items-center gap-2 text-[10.5px] text-muted-foreground">
                  <span>{moment(item.created_date).fromNow()}</span>
                  {item.href && (
                    <Link to={item.href} className="underline underline-offset-2 hover:text-foreground">
                      Open
                    </Link>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => remove(item)}
                aria-label="Delete notification"
                className="shrink-0 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-destructive"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}